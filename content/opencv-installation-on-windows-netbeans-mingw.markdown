When I first started using OpenCV, I encountered two major difficulties:

1. Getting my programs NOT to crash immediately.
2. Making Netbeans play nice, and especially getting timehe debugger to work.

I read many tutorials and "how-to" articles, but none was really comprehensive
and thorough. Eventually I succeeded in setting up the environment; and after a
while of using this (great) library, I decided to write this small tutorial,
which will hopefully help others.

The are three parts to this tutorial:

1. Compiling and installing OpenCV.
2. Configuring Netbeans.
3. An example program.

**The environment I use is**:
Windows 7, OpenCV 2.4.0, Netbeans 7 and MinGW 3.20 (with compiler gcc 4.6.2).

**Assumptions**:
You already have MinGW and Netbeans installed on your system.

# Compiling and installing OpenCV
When downloading OpenCV, the archive actually already contains pre-built
binaries (compiled libraries and DLL's) in the 'build' folder. At first, I
tried using those binaries, assuming somebody had already done the job of
compiling for me. That didn't work.

**Eventually I figured I have to compile the entire library on my own system in
order for it to work properly.**

Luckily, the compilation process is rather easy, thanks to CMake.  CMake
(stands for Cross-platform Make) is a tool which generates makefiles specific
to your compiler and platform. We will use CMake in order to configure our
building and compilation settings, generate a 'makefile', and then compile the
library.

The steps are:

1. Download [CMake][1] and install it (in the installation wizard choose to add
   CMake to the system PATH).
2. Download the 'release' version of [OpenCV][2].
3. Extract the archive to a directory of your choice. I will be using
   `c:/opencv/`.
4. Launch CMake GUI.
    1. Browse for the source directory `c:/opencv/`.
    2. Choose where to build the binaries. I chose `c:/opencv/release`.  
       ![CMake Configuration - 1][img1]
    3. Click 'Configure'. In the screen that opens choose the generator
       according to your compiler. In our case it's 'MinGW Makefiles'.  
       ![CMake Configuration - 2][img2]
    4. Wait for everything to load, afterwards you will see this screen:  
       ![CMake Configuration - 3][img3]
    5. Change the settings if you want, or leave the defaults. When you're
       done, press 'Configure' again. You should see 'Configuration done' at
       the log window, and the red background should disappear from all the
       cells.  
       ![CMake Configuration - 4][img4]
    6. At this point CMake is ready to generate the makefile with which we will
       compile OpenCV with our compiler. Click 'Generate' and wait for the
       makefile to be generated. When the process is finished you should see
       'Generating done'. From this point we will no longer need CMake.
5. Open MinGW shell (The following steps can also be done from Windows' command
   prompt).
    1. Enter the directory `c:/opencv/release/`.
    2. Type `mingw32-make` and press enter. This should start the compilation
       process.  
       ![MinGW Make][img5]  
       ![MinGW Make - Compilation][img6]
    3. When the compilation is done OpenCV's binaries are ready to be used.
    4. For convenience, **we should add the directory `C:/opencv/release/bin`
       to the system PATH**. This will make sure our programs can find the
       needed DLL's to run.

# Configuring Netbeans
Netbeans should be told where to find the header files and the compiled
libraries (which were created in the previous section).

The header files are needed for two reasons: for compilation and for code
completion. The compiled libraries are needed for the linking stage.

Note: In order for debugging to work, the OpenCV DLL's should be available,
which is why we added the directory which contains them to the system PATH
(previous section, step 5.4).

First, you should verify that Netbeans is configured correctly to work with
MinGW. Please see the screenshot below and verify your settings are correct
(considering paths changes according to your own installation). **Also note**
that the `make` command should be from msys and **not** from Cygwin.

![Netbeans MinGW Configuration][img7]

Next, for each new project you create in Netbeans, you should define the
include path (the directory which contains the header files), the libraries
path and the specific libraries you intend to use.  Right-click the project
name in the 'projects' pane, and choose 'properties'.  Add the include path
(modify the path according to your own installation):

![Netbeans Project Include Path][img8]

Add the libraries path:

![Netbeans Libraries Path][img9]

Add the specific libraries you intend to use. These libraries will be
dynamically linked to your program in the linking stage. Usually you will need
the `core` library plus any other libraries according to the specific needs of
your program.

![Netbeans Include Libraries][img10]

That's it, you are now ready to use OpenCV!

# Summary
Here are the general steps you need to complete in order to install OpenCV and
use it with Netbeans:

1. Compile OpenCV with your compiler.
2. Add the directory which contains the DLL's to your system PATH (in our case:
   c:/opencv/release/bin).
3. Add the directory which contains the header files to your project's include
   path (in our case: c:/opencv/build/include).
4. Add the directory which contains the compiled libraries to you project's
   libraries path (in our case: c:/opencv/release/lib).
5. Add the specific libraries you need to be linked with your project (for
   example: libopencv_core240.dll.a).

# Example – "Hello World" with OpenCV
Here is a small example program which draws the text "Hello World : )" on a GUI
window. You can use it to check that your installation works correctly. After
compiling and running the program, you should see the following window:

![OpenCV Hello World][img11]

    #!c++
    #include "opencv2/opencv.hpp"
    #include "opencv2/highgui/highgui.hpp"

    using namespace cv;

    int main(int argc, char** argv) {
        //create a gui window:
        namedWindow("Output",1);

        //initialize a 120X350 matrix of black pixels:
        Mat output = Mat::zeros( 120, 350, CV_8UC3 );

        //write text on the matrix:
        putText(output,
                "Hello World :)",
                cvPoint(15,70),
                FONT_HERSHEY_PLAIN,
                3,
                cvScalar(0,255,0),
                4);

        //display the image:
        imshow("Output", output);

        //wait for the user to press any key:
        waitKey(0);

        return 0;
    }

[1]:http://www.cmake.org/
[2]:http://opencv.willowgarage.com/wiki/

[img1]:images/opencv-installation-on-windows-netbeans-mingw/cmake-1.png
[img2]:images/opencv-installation-on-windows-netbeans-mingw/cmake-2.png
[img3]:images/opencv-installation-on-windows-netbeans-mingw/cmake-31.png
[img4]:images/opencv-installation-on-windows-netbeans-mingw/cmake-4.png
[img5]:images/opencv-installation-on-windows-netbeans-mingw/cmake-5.png
[img6]:images/opencv-installation-on-windows-netbeans-mingw/cmake-5b.png
[img7]:images/opencv-installation-on-windows-netbeans-mingw/netbeans-mingw1.png
[img8]:images/opencv-installation-on-windows-netbeans-mingw/netbeans-include.png
[img9]:images/opencv-installation-on-windows-netbeans-mingw/netbeans-libraries1.png
[img10]:images/opencv-installation-on-windows-netbeans-mingw/netbeans-use-libraries.png
[img11]:images/opencv-installation-on-windows-netbeans-mingw/opencv-hello-world.png
