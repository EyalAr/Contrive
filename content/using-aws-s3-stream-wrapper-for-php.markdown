Amazon’s [AWS PHP SDK][1] offers a [stream wrapper][2] for S3.

By registering the `s3://` protocol, it’s possible to use PHP’s file handling
functions; such as `fopen()`, `fread()`, `rename()`, `mkdir()`, `unlink()`,
etc...; directly with URLs in the form of `s3://bucket/path/to/object`. Thus,
eliminating the cumbersome syntax of the API’s methods.

Without the stream wrapper, we would have to write more code in order to
achieve desired operations. For example:

    #!php
    <?php
    //rename the object 'foo.txt' to 'bar.txt' in bucket 'myBucket':
    //there is no 'rename' method in the API, so we first have to copy the
    //object to the new location, and then delete the old one:
    $response = $s3->copy_object(
        array(
            'bucket'   => 'myBucket',
            'filename' => 'foo.txt'
        ),
        array(
            'bucket'   => 'myBucket',
            'filename' => 'bar.txt'
        )
    );
    if ($response->isOK()){
        $response = $s3->delete_object('myBucket', 'foo.txt');
        if (!$response->isOK()){
            //handle error...
        }
    }

    //read contents of object 'foo/bar.txt' in bucket 'myBucket':
    $data = $s3->get_object(
        'myBucket',
        'foo/bar.txt'
    ))->body;

    //store data in object 'foo/bar.txt' in bucket 'myBucket':
    $response = $s3->create_object(
        'myBucket',
        'foo/bar.txt',
        array(
            'body' => 'data...'
        )
    );
    ?>

But with the stream wrapper, we can use PHP’s corresponding functions, in a neater and shorter fashion.

First, we have to register the `s3://` protocol:

    #!php
    <?php
    define('AWS_KEY','YOUR_AWS_KEY_HERE');
    define('AWS_SECRET','YOUR_AWS_SECRET_HERE');

    require_once('AWSSDKforPHP/sdk.class.php');
    require_once('AWSSDKforPHP/extensions/s3streamwrapper.class.php');

    $s3 = new AmazonS3(array(
        'key' => AWS_KEY,
        'secret' => AWS_SECRET,
        'default_cache_config' => '',
        'certificate_authority' => true
    ));

    S3StreamWrapper::register($s3);
    ?>

Usage example:

    #!php
    <?php
    //rename the object 'foo.txt' to 'bar.txt' in bucket 'myBucket':
    rename('s3://myBucket/foo.txt', 's3://myBucket/bar.txt');

    //delete the object 'bar.txt' from bucket 'myBucket':
    unlink('s3://myBucket/bar.txt');

    //create a new bucket 'mySecondBucket':
    mkdir('s3://mySecondBucket');

    //read contents of object 'foo/bar.txt' in bucket 'myBucket':
    $data = file_get_contents('s3://myBucket/foo/bar.txt');

    //store data in object 'foo/bar.txt' in bucket 'myBucket':
    file_put_contents('s3://myBucket/foo/bar.txt', 'data...');
    ?>

One thing which is important to note:

> It is important to avoid reading files that are near to or larger than the
> amount of memory allocated to PHP, otherwise “out of memory” errors will
> occur.

([Quoted from the SDK’s documentation][3])

So, if you handle large file in your code, and encounter such errors, there is
no alternative (which I know of) than to revert to the ordinary methods of the
SDK.

**Note**:
Code in this post can also be found in [this gist][4].

[1]:http://aws.amazon.com/sdkforphp/
[2]:http://php.net/manual/en/class.streamwrapper.php
[3]:http://docs.amazonwebservices.com/AWSSDKforPHP/latest/index.html#m=S3StreamWrapper/stream_read
[4]:https://gist.github.com/EyalAr/3898611
