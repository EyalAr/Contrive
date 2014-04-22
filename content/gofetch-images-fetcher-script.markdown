'GoFetch' is an images fetcher script which I’ve written in Python.

It retrieves a list of images urls according to specified search parameters.
The script can use either Bing’s or Google’s images search services. Search
parameters can be defined via definitions ini file, or by prompting the user.
The output is a list of image urls, which can be printed to stdout or to a
file.

For Google’s service, an [API key][1] and a [custom search engine ID][2] are
required.

For Bing’s service, an [account ID][3] is required, as well as a valid
developer subscription to the search service.

For the source code, please visit [this git repository][4].

[1]:https://code.google.com/apis/console
[2]:http://www.google.com/cse
[3]:https://datamarket.azure.com/dataset/5BA839F1-12CE-4CCE-BF57-A49D98D29A44
[4]:https://bitbucket.org/EyalAr/gofetch
