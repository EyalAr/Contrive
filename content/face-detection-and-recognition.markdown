OpenCV offers a good face detection and recognition [module][1] (by [Philipp
Wagner][2]). It contains algorithms which can be used to perform some cool
stuff. In this guide I will roughly explain how face detection and recognition
work; and build a demo application using OpenCV which will detect and recognize
faces. (Also, there is a nice video of the result at the end).

# Theory
## Face Detection
As can be assumed, detecting a face is simpler than recognizing a face of a
specific person. In order to be able to determine that a certain picture
contains a face (or several) we need to be able to define the general structure
of a face. Luckily human faces do not greatly differ from each other; we all
have noses, eyes, foreheads, chins and mouths; and all of these compose the
general structure of a face.

Consider the following 5 figures:

![Feature 1][img1] ![Feature 2][img2] ![Feature 3][img3] ![Feature 4][img4]
![Feature 5][img5]

Each of these figures represents a general feature of a human face. Combining
all the features together we, indeed, receive something that resembles a face.

![All Features][img6]

By determining if each of these features is similar to some part of our
picture, we can conclude if the picture contains a face or not. Notice that
this does not have to be an accurate match; we just need to know if, roughly,
each of these features corresponds to some part of the image. The technique
used for this purpose is [Template Matching][3].

By gathering statistics about which such features compose faces and how, we can
train our algorithm to use the right features in the right positions; and thus
detect faces.

Let's see an example. See in the figures below how the above features can be
used to detect a face (namely, the face of President Barack Obama).

![Obama Color][img7] ![Obama Binary][img8] ![Obama Features][img9]

In order for this process be quick, we design it in such a way that we first
check the coarse features which represent the coarse structure of a face; and
only if these features match, we continue to the next iteration and use finer
features. In each such iteration we can quickly reject areas of the picture
which do not match a face, and keep checking those which we are not sure about.
In every iteration we increase the certainty that the checked area is indeed a
face, until finally we stop and make our determination.

In other words, rather than determining if the image does contain a face, we
can more quickly determine if the image does not contain a face; because
eliminations can be done quickly, while acceptance of faces will require more
time. We call such a process a cascading process.

The method depicted here is an over-simplified description of the [Viola-Jones
method][4] (also known as Haar cascades). A very nice visualization of this
method can be seen in the following video by Adam Harvey.

<iframe src="//player.vimeo.com/video/12774628" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## Face Recognition
The difference between face detection and recognition is that in detection we
just need to determine if there is some face in the image, but in recognition
we want to determine whose face it is. In the above example we *detected* a
face, which we *recognize* as President Obama.

In order to understand the methods for recognizing faces, more advanced
mathematical knowledge is required; namely linear algebra and statistics.

OpenCV provides three methods of face recognition: Eigenfaces, Fisherfaces and
Local Binary Patterns Histograms (LBPH).

All three methods perform the recognition by comparing the face to be
recognized with some training set of known faces. In the training set, we
supply the algorithm faces and tell it to which person they belong. When the
algorithm is asked to recognize some unknown face, it uses the training set to
make the recognition. Each of the three aforementioned methods uses the
training set a bit differently.

Eigenfaces and Fisherfaces find a mathematical description of the most dominant
features of the training set as a whole. LBPH analyzes each face in the
training set separately and independently.

An example training set:  
![Example Training Set][img10]

### Eigenfaces & Fisherfaces
Those familiar with linear algebra will remember that every vector space has
an orthogonal basis. By combining elements of this basis we can compose every
vector in this vector space. And vice versa, every vector in the vector space
can be decomposed to the elements of the basis.

Images (grayscale) are nothing more than a series of numbers, each number
corresponding to some intensity level. So why not treat images as vectors? Say,
for example, we have a collection of face images of size 150 by 150 pixels;
each of these images can be thought of as a vector of size 22,500 (150\*150).
We can now talk about the vector space in which these vectors reside. By
treating the images as samples of data, we can perform a [Principal Components
Analysis][5] and obtain the eigenvectors which make up the basis of the vector
space.

![Principal componenets of a dataset][img11]  
Principal components of a dataset (Source: [Wikipedia][6]).

These eigenvectors represent the most prominent features of the dataset, and
since we talk about face images, the eigenvectors actually represent the
strongest characteristics of the faces in the dataset. See for example the
first 8 eigenvectors of the dataset from above:

![First 8 eigenfaces of the training set][img12]  
(To extract the eigenfaces of the training set I wrote a small Matlab script
which can be [obtained here][7]).

Now, whenever we are provided with a new, unknown, face, we can decompose it to
the basis we found, see which eigenvector(s) “explain” most of the face, and
thus determine to which person it belongs.

### Local Binary Patterns Histogram
The [LBPH][8] method takes a different approach than the eigenfaces method.
In LBPH each images is analyzed independently, while the eigenfaces method
looks at the dataset as a whole. The LBPH method is somewhat simpler, in the
sense that we characterize each image in the dataset locally; and when a new
unknown image is provided, we perform the same analysis on it and compare the
result to each of the images in the dataset. The way which we analyze the
images is by characterizing the local patterns in each location in the image.

Following is such a [local binary patterns][8] analysis on each of the images
of the dataset from above:

![Local binary patterns of the 10 images in the training set][img13]  
(To extract the local binary patterns of the training set I used this [Matlab
script][9]).

# Demo Application
For the purpose of this guide, and to make it interesting, we will build an
application which given a video file and a person, seeks this person in the
video. Formally, we define the following inputs and outputs of our application:

**Inputs:**

1.  A video file.
2.  A person. We need around 10 different images of this person's face in
    order to be able to recognize him/her. We will use the dataset of the
    faces of President Barack Obama presented earlier.

**Outputs:**

1.  A video file which is identical to the original video, except that
    the face of the recognized person is in a green circle, and
    unrecognized faces in red circles.
2.  A CSV file which gives the recognition confidence for each recognized
    face in each frame of the video.

## The Plan
Before we start coding, we better understand the different components in our
application.

As was already mentioned, our goal is to determine in which frames of the video
our chosen person appears. We also want to create two output files, a video in
which the faces are circled in green or red (depending upon the person to which
the face belongs), and a CSV file with the confidence level of each face in
each frame. For this, I propose the following scheme:

1.  Read the next frame of the input video.
2.  Detect all the faces in the frame.
3.  Try to recognize each of the detected faces as our chosen person.
4.  If successful, draw a green circle around the face. Otherwise, draw a
    red circle.
5.  Write the confidence level of each face in the frame to a CSV file.
6.  Repeat steps 1-5 until no more frames in the input video.

Evidently, our application should have the following major components:

1.  Frames reader.
2.  Faces detector.
3.  Person recognizer.
4.  Frames writer.
5.  CSV writer.

Each of these components will be expanded in the following sections.

**Note:**  
In order to simplify this guide, we will do only frontal faces detection.

## The Code
The full code of the application can be obtained in [this git repository][10]
(It's a [Netbeans project][post1] which you can load directly to your
[Netbeans IDE][11]).

### Faces Detector

    #!c++
    class FaceDetector {
    public:
        FaceDetector(
                const string &cascadePath,
                double scaleFactor,
                int    minNeighbors,
                double minSizeRatio,
                double maxSizeRatio);
        virtual ~FaceDetector();
        void findFacesInImage(const Mat &img, vector<Rect> &res);
    private:
        CascadeClassifier _cascade;
        double _scaleFactor;
        int    _minNeighbors;
        double _minSizeRatio;
        double _maxSizeRatio;
    };

As explained earlier in this guide, we use the Haar cascades method to do the
detection. OpenCV provides the `CascadeClassifier` object for this purpose,
which I recommend reading about ([Here][12]).

In the `FaceDetector` class of our application we implement a method
`findFacesInImage` which, given an image, returns the rectangular coordinates
of all faces in it. Note that in this application we detect only frontal faces.
Implementing detection of profiles and faces from other angles is very similar
and straightforward.

### Person Recognizer

    #!c++
    class PersonRecognizer {
    public:
        PersonRecognizer(const vector<Mat> &imgs, int radius, int neighbors,
                int grid_x, int grid_y, double threshold);
        virtual ~PersonRecognizer();
        bool recognize(const Mat &face, double &confidence) const;
    private:
        Ptr<FaceRecognizer> _model;
        Size _faceSize;
    };

Following the explanation about face recognition, we will be using the LBPH
method. We will use OpenCV's [`FaceRecognizer`][13] module. Look at the [full
code][10] to see the specifics of the implementation. The `PersonRecognizer`
class is trained (upon construction) to recognize a specific person, by
receiving a vector of faces which belong to this person. In the code you will
see the implementation of the `recognize` method, which given an image of a
face will determine if this is the person the class was trained to recognize.
The method returns a Boolean value according to the result of the recognition,
and if there was recognition, the confidence is stored in the `confidence`
variable.

### Frames Reader
Luckily, OpenCV offers a good library for handling video files, which we will
wrap with our own interface.

We define the following class:

    #!c++
    class FramesReader
    {
    public:
        FramesReader(const string &vidPath, int startFrame, int endFrame, int delta);
        virtual ~FramesReader();
        bool getNext(Mat &frame);
        Size getSize();
    private:
        VideoCapture _vid;
        int _endFrame,
            _delta;
    };

We use the `getNext` method to obtain the next frame in the video, and
`getSize` to obtain the size of the frame (in pixels).

### Frames Writer
We define the following class, which is self explanatory:

    #!c++
    class FramesWriter
    {
    public:
        FramesWriter(const string vidPath, double fps, Size size, int fourcc);
        virtual ~FramesWriter();
        void write(Mat &frame);
    private:
        VideoWriter _vid;
        Size _f_size;
    };

### CSV Writer

    #!c++
    class CsvWriter {
    public:
        CsvWriter(const string &csvPath);
        virtual ~CsvWriter();
        void nextLine();
        void addEntry(const string &s);
    private:
        ofstream _fs;
        bool _isFirstEntry;
    };

## Results
In order to test the application we run it on [this video of President Barack
Obama][14]. We use the training set from above.

The resulting output video:

<iframe width="640" height="360" src="//www.youtube.com/embed/CXV9R6Z0-Jw?rel=0" frameborder="0" allowfullscreen></iframe>

By using the data of the CSV file, we obtain the confidence level in each frame
of the video:

![Confidence of recognition of each frame][img14]

By setting some threshold value, we can obtain a binary determination (yes/no)
of which frames contain the face (frontal) of President Obama:

![Frontal face recognition in each frame][img15]

For example, we can tell, just by looking at this analysis, that in frame 4100
President Obama does not face forward, but in frame 4600 he does:

Frame 4100:  
![Frame 4100][img16]

Frame 4600:  
![Frame 4600][img17]

# Summary
We have seen examples of both detection and recognition of faces. The theory
behind the two subjects is quite interesting. The OpenCV library implements for
us the major algorithms used for these tasks.

By employing OpenCV we built an example application which is capable of
recognizing a specific person in a video, which might also contain other
people. The application successfully recognized where in the video our chosen
person (President Obama) faces towards the camera.

As was mentioned, the application was trained to recognize and detect only
frontal faces, but it can be easily extended to recognize and detect faces in
more angles and positions.

[1]:http://opencv.willowgarage.com/wiki/FaceRecognition
[2]:http://www.bytefish.de/
[3]:http://en.wikipedia.org/wiki/Template_matching
[4]:http://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework
[5]:https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors#Principal_components_analysis
[6]:https://en.wikipedia.org/wiki/File:GaussianScatterPCA.png
[7]:https://gist.github.com/EyalAr/5196200
[8]:http://en.wikipedia.org/wiki/Local_binary_patterns
[9]:http://www.mathworks.com/matlabcentral/fileexchange/36484-local-binary-patterns
[10]:https://bitbucket.org/EyalAr/person-recognizer
[11]:https://netbeans.org/
[12]:http://docs.opencv.org/modules/objdetect/doc/cascade_classification.html
[13]:http://docs.opencv.org/trunk/modules/contrib/doc/facerec/facerec_api.html
[14]:http://www.whitehouse.gov/photos-and-video/video/2013/03/12/president-obama-speaks-presidents-export-council-meeting

[post1]:opencv-installation-on-windows-netbeans-mingw.markdown

[img1]:images/face-detection-and-recognition/features-eyebrows.jpg
[img2]:images/face-detection-and-recognition/features-nose.jpg
[img3]:images/face-detection-and-recognition/haar-eyes.jpg
[img4]:images/face-detection-and-recognition/features-mouth.jpg
[img5]:images/face-detection-and-recognition/features-chin.jpg
[img6]:images/face-detection-and-recognition/haar-all.jpg
[img7]:images/face-detection-and-recognition/obama-color.jpg
[img8]:images/face-detection-and-recognition/obama-binary.jpg
[img9]:images/face-detection-and-recognition/haar-features-all-obama.jpg
[img10]:images/face-detection-and-recognition/training_set.jpg
[img11]:images/face-detection-and-recognition/princomp.png
[img12]:images/face-detection-and-recognition/eigenfaces.jpg
[img13]:images/face-detection-and-recognition/lbp.jpg
[img14]:images/face-detection-and-recognition/chart-confidence-600.png
[img15]:images/face-detection-and-recognition/chart-appearances-600.png
[img16]:images/face-detection-and-recognition/frame4100-600.jpg
[img17]:images/face-detection-and-recognition/frame4600-600.jpg
