I am using plain text editors, such as Sublime Text and Vim, not only for
writing code, but also for other types of documents, such as blog posts. In Vim
it's easy to get the word count, but in ST I did not find such a built-in
option. What I wanted was simple - whenever I select a text I want to have the
number of words in the selection written in the status bar.

Trying to find a solution in Google yields such a plug-in for ST2. For ST3 I was
not able to find anything satisfactory. Granted, maybe I didn't look hard
enough; but I needed something simple, and I thought it would be a good
opportunity to look into ST's plug-ins API. Unlike Vim, which has its own
scripting language, ST uses Python.

The [documentation][1] is not very extensive, but the [Python API][2] provides
basic explanations (It would be nice to see more examples and thorough
explanations).

In order to create a plug-in we have to extend one of the classes in the
`sublime_plugin` module. Each class provides functionalities for a different
kind of plug-in. In our case we will be extending the `EventListener` class. We
will be counting the words inside the selected regions on any event of selection
change.

At first I approached the problem by obtaining the selected text in the current
view and, using a regex, finding the number of words in the text. The regex I
used was `[a-zA-Z0-9_][\s,\.;:#\(\)-\?!]+(?=([a-zA-Z0-9_]))`, which matches any
string that represents a separation between words. Such a string is composed of:

1.  Any one letter or number: `[a-zA-Z0-9_]`
2.  Any combination of white spaces and punctuation marks: `[\s,\.;:#\(\)-\?!]+`
3.  Any one letter or number: `(?=([a-zA-Z0-9_]))`

The last part matches any letter or number, but does not consume it (just a
lookahead), so that in case of one letter words we do not miss any match.

This approached worked, but then I noticed that the API provides a `classify`
method in the `View` class, which allows to get a classification for a point in
the text. This made things easier, because it means ST already detects when a
new word starts for us. And indeed one of the classifications this method
returns is `CLASS_WORD_START`.

So all we need to do now is iterate over all the characters in the selection and
count how many of them are a start of a new word:

    #!python
    import sublime, sublime_plugin, re

    class CountWordsInSelectionCommand(sublime_plugin.EventListener):

        def on_selection_modified(self, view):
            '''
            listen to event 'on_selection_modified' and count words in all
            selected regions when invoked.
            '''

            # clear status bar if nothing is selected
            if len(view.sel()) == 1 and view.sel()[0].size() == 0:
                view.set_status("words_in_selection", "")
                return

            count = 0
            for region in view.sel():
                for i in range(region.begin(), region.end()):
                    if view.classify(i) & sublime.CLASS_WORD_START:
                        count += 1
            
            view.set_status("words_in_selection", "{} words".format(count))

The code can also be downloaded from [this gist][3].

To install the plug-in just put the file in the `Packages/User` directory. In
Linux the full path is `~/.config/sublime-text-3/Packages/User`.

[1]:http://docs.sublimetext.info/en/latest/extensibility/plugins.html
[2]:https://www.sublimetext.com/docs/3/api_reference.html
[3]:https://gist.github.com/EyalAr/8383050