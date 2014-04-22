In this post I will show the method I use to track outbound 'click' events
(clicks which take the user away from the current page) with Google Analytics.
I will be using the new [Analytics.js][1] and [jQuery][2] in the code samples.

Events tracking is a useful part of Google Analytics which allows to track
and gather statistics about various types of user interaction with the page.
One of these interactions is clicking on links in the page. We want to know
where the user is going from our page. Each time we want to inform GA about
events in our page, we need to send the relevant data to the servers. For this,
GA provides us with the [send][3] method.

A naive way to do it would be to bind the Javascript `onclick` event with a
function (an [event listener][4]) that sends the event's data to GA:

    #!javascript
    // register an event listener to the 'click' event:
    $("...").on('click', function(e){
        ga('send', {
            'hitType': 'event',
            'eventCategory': '...',
            'eventAction': '...',
            'eventLabel': '...',
            }
        });
    });

This method will not always work, as we cannot guarantee that the `send` data
will be received by GA before the browser unloads our page and loads the new
link.

So any solution we propose must ensure that the data will be sent **before**
the user is redirected to the new page.

*W3C* specifies that an event's default action [may be cancelled][5] by another
registered event listener. It also specified that before the event's default
action is processed, all other registered event listeners must be triggered.

> These listeners then have the option of canceling the implementation's
> default action...

We can use this fact to prevent the browser from loading the new link before
sending the data to GA. The default action for a link click event is, of course,
loading the link's page. If we prevent the browser from loading the link's page
when the link is clicked (by using the event object's [preventDefault][6]
method), we can send the data to GA without interruptions; and then manually
redirect to the clicked link.

Many of the solutions I have seen online suggest to use Javascript's
`setTimeout` function in order to delay the loading of the new page, thus
providing enough time for GA to receive the data. It is usually implemented in
the following manner:

    #!javascript
    $("...").on('click', function(e){
        // prevent browser from loading the new page:
        e.preventDefault();

        // send data to GA:
        ga('send', {
            'hitType': 'event',
            'eventCategory': '...',
            'eventAction': '...',
            'eventLabel': '...',
            }
        });

        // manually load the new page after a timeout:
        setTimeout('window.location = new_page_url', 100);
    });

In this example I use a delay of 100ms, which is what most solutions on the web
use as well. This should usually provide enough time for the data to reach GA's
servers before loading the new page. We also need to take into account that this
delay affects the responsiveness of our page. We don't want this number to be
too big, because then the delay will be noticeable to the user.

I see two problems with this solution. The first is that any delay we choose
(whether it's 100 or any other number) might not be enough for the data to reach
GA; but we can't use a default big number, because this will impair the
responsiveness of the page. The second is that the number we choose might be
too big. Maybe in most times the data will reach GA much sooner than the delay
we use, thus causing the user an unnecessary delay.

This solution was valid for the older versions of GA, in which it was not
possible to use callback functions with the `send` command.  But with newer
versions of GA, we can take advantage of Javascript's asynchronous nature,
namely callback functions. GA allows us to [register a callback function][7] to
the `send` command. The [official documentation][7] even mentions this can be
used to track outbound clicks:

> That way you can send a user to their destination only after their click has
> been reported to Google Analytics.

This effectively means the user is delayed only for the exact required amount
of time for the data to reach GA's server; before redirecting to the new page.

Such a solution will employ the `hitCallback` property as follows:

    #!javascript
    $("...").on('click', function(e){
        // prevent browser from loading the new page:
        e.preventDefault();

        // send data to GA:
        ga('send', {
                'hitType': 'event',
                'eventCategory': '...',
                'eventAction': '...',
                'eventLabel': '...',
                'hitCallback': function(){
                    // redirect:
                    window.location = 'new_page_url';
                }
            }
        });
    });

Usually GA's servers are fast enough for the callback to fire almost immediately
and the delay to be unnoticeable. But on some cases (slow connections,
firewalls, etc.) GA's servers are unreachable or very slow, thus making the
callback never fire and the redirection to never occur. For these cases we can
use `setTimeout` as a safety net. If the callback is not fired within a
reasonable amount of time, we redirect anyway:

    #!javascript
    $("...").on('click', function(e){
        // prevent browser from loading the new page:
        e.preventDefault();

        // register safety net timeout:
        var t = setTimeout('window.location = new_page_url', 250);

        // send data to GA:
        ga('send', {
                'hitType': 'event',
                'eventCategory': '...',
                'eventAction': '...',
                'eventLabel': '...',
                'hitCallback': function(){
                    clearTimeout(t);
                    // redirect:
                    window.location = 'new_page_url';
                }
            }
        });
    });

If the timeout is never cleared by the callback, it means it hasn't been fired,
so after 250ms we redirect anyway; not sending the data to GA, but at least
redirecting the user to the new page.

[1]:https://developers.google.com/analytics/devguides/collection/analyticsjs/
[2]:http://jquery.com/
[3]:https://developers.google.com/analytics/devguides/collection/analyticsjs/advanced#send
[4]:http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventListener
[5]:http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-cancelation
[6]:http://www.w3.org/TR/DOM-Level-3-Events/#widl-Event-preventDefault
[7]:https://developers.google.com/analytics/devguides/collection/analyticsjs/advanced#hitCallback
