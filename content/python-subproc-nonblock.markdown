In one of my projects I had to run an interactive shell application as a
subprocess. I would send commands through the process' `stdin` pipe and read
the results through its `stdout` pipe. As this subprocess is an interactive
shell, it never terminates. This means that the subprocess' `stdout` pipe
stays open, even if no new data is streamed through; which causes various
problems with Python's stream reading functions (namely the `readline`
function). Specifically, trying to read from such a stream causes the reading
functions to hang until new data is present.

When dealing with a subprocess such an interactive shell, it's natural that
the stream stays open but no data arrives.

In my project, I wanted to interact with the subprocess by issuing commands
through its `stdin`, reading the result through its `stdout`, do some other
things in my script, and repeat this process. But every time I read from the
subprocess' `stdout`, my script would hang.

To demonstrate, we could simulate the problem using the following code:

`shell.py`:

    #!python
    import sys
    while True:
        s = raw_input("Enter command: ")
        print "You entered: {}".format(s)
        sys.stdout.flush()

`client.py`:

    #!python
    from subprocess import Popen, PIPE
    from time import sleep

    # run the shell as a subprocess:
    p = Popen(['python', 'shell.py'],
            stdin = PIPE, stdout = PIPE, stderr = PIPE, shell = False)
    # issue command:
    p.stdin.write('command\n')
    # let the shell output the result:
    sleep(0.1)
    # get the output
    while True:
        output = p.stdout.read() # <-- Hangs here!
        if not output:
            print '[No more data]'
            break
        print output

`shell.py` is a dummy shell which receives input and echoes it to `stdout`.
It does it in an infinite loop, always waiting for new input, and never ends.

`client.py` demonstrates how we would usually try to read a subprocess' input.
In this case the subprocess is our dummy shell. Running this example shows
that indeed the `read` function in line 13 hangs, as no new data is received
from the (still open) `p.stdout` stream.

The origin of this problem is in the way these reading mechanisms are
implemented in Python (See the [discussion on this issue][1] from Python's
issue tracker). In Python 2.7.6, the implementation relies on C's stdio
library. Specifically, the read function. The following quote from the
[library's documentation][2] makes things clear:
> If some process has the pipe open for writing and O_NONBLOCK is clear,
> read() shall block the calling thread until some data is written or the pipe
> is closed by all processes that had the pipe open for writing.

So now we understand that unless the `O_NONBLOCK` flag is set, then `read`
will block until new data arrives.

And indeed, by taking a look at Python's source code, we can see that in the
`IO` module implementation the `O_NONBLOCK flag` is never set (see the
[fileio_init function][3], and follow setting of flags in the flag variable
throughout the function).

So how do we solve this?

If we were programming in C, we would simply set the `O_NONBLOCK` flag of our
file descriptor using the [fcntl.h][4] library. Indeed, Python provides us
with an interface to this library's mechanisms through the [fcntl module][5].
So one solution would be to manually set the `O_NONBLOCK` flag of our file
descriptor and then use the os's file reading mechanisms through the
[os module][6].

Such a solution will look something like this:

`client_O_NONBLOCK.py`:

    #!python
    from subprocess import Popen, PIPE
    from time import sleep
    from fcntl import fcntl, F_GETFL, F_SETFL
    from os import O_NONBLOCK, read

    # run the shell as a subprocess:
    p = Popen(['python', 'shell.py'],
            stdin = PIPE, stdout = PIPE, stderr = PIPE, shell = False)
    # set the O_NONBLOCK flag of p.stdout file descriptor:
    flags = fcntl(p.stdout, F_GETFL) # get current p.stdout flags
    fcntl(p.stdout, F_SETFL, flags | O_NONBLOCK)
    # issue command:
    p.stdin.write('command\n')
    # let the shell output the result:
    sleep(0.1)
    # get the output
    while True:
        try:
            print read(p.stdout.fileno(), 1024),
        except OSError:
            # the os throws an exception if there is no data
            print '[No more data]'
            break

And it works!

But, changing flags of file descriptors isn't everyones cup of tea.  
Instead, we can employ another nice solution which uses threads. Instead of
changing the behaviour of the reading functions, we let them block and wait
for new data as much as they want. But they do it on another thread. On that
thread, the reading functions will read data once it becomes available in the
stream, and block the rest of the time. But in order to reach the read data
from the main thread, we need some kind of proxy. We could, for example, use
a list, a queue, a file on disk, etc. An elegant solution which uses a queue
is presented [here][7]. I present here a slightly modified version.

First, we wrap the stream we want to read from with a class. This class opens
a separate thread which reads from the stream whenever data becomes available
and stores the data in a queue (A queue in Python is threads-safe). This class
also exposes a `readline` function, which pulls from the queue the data.

`nbstreamreader.py`:

    #!python
    from threading import Thread
    from Queue import Queue, Empty

    class NonBlockingStreamReader:

        def __init__(self, stream):
            '''
            stream: the stream to read from.
                    Usually a process' stdout or stderr.
            '''

            self._s = stream
            self._q = Queue()

            def _populateQueue(stream, queue):
                '''
                Collect lines from 'stream' and put them in 'quque'.
                '''

                while True:
                    line = stream.readline()
                    if line:
                        queue.put(line)
                    else:
                        raise UnexpectedEndOfStream

            self._t = Thread(target = _populateQueue,
                    args = (self._s, self._q))
            self._t.daemon = True
            self._t.start() #start collecting lines from the stream

        def readline(self, timeout = None):
            try:
                return self._q.get(block = timeout is not None,
                        timeout = timeout)
            except Empty:
                return None

    class UnexpectedEndOfStream(Exception): pass

Now our original attempt for the client remains almost the same, and much more
intuitive than using the `fcntl` module.

`client_thread.py`:

    #!python
    from subprocess import Popen, PIPE
    from time import sleep
    from nbstreamreader import NonBlockingStreamReader as NBSR

    # run the shell as a subprocess:
    p = Popen(['python', 'shell.py'],
            stdin = PIPE, stdout = PIPE, stderr = PIPE, shell = False)
    # wrap p.stdout with a NonBlockingStreamReader object:
    nbsr = NBSR(p.stdout)
    # issue command:
    p.stdin.write('command\n')
    # get the output
    while True:
        output = nbsr.readline(0.1)
        # 0.1 secs to let the shell output the result
        if not output:
            print '[No more data]'
            break
        print output

**Note**: All code from this post can be obtained in [this gist][8].

[1]:http://bugs.python.org/issue1175
[2]:http://pubs.opengroup.org/onlinepubs/009604499/basedefs/unistd.h.html
[3]:http://hg.python.org/cpython/file/3a1db0d2747e/Modules/_io/fileio.c#l176
[4]:http://pubs.opengroup.org/onlinepubs/009696799/basedefs/fcntl.h.html
[5]:http://docs.python.org/2/library/fcntl.html
[6]:http://docs.python.org/2/library/os.html#file-descriptor-operations
[7]:http://stackoverflow.com/a/4896288/1365324
[8]:https://gist.github.com/EyalAr/7915597
