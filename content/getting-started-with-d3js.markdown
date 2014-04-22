<iframe src="http://eyalar.github.io/D3.js-Example/index.html?6!0"></iframe>

## Introduction

[D3.js](http://d3js.org/) stands for Data Driven Documents. It's a very comprehensive library which provides many tools for data-based calculations and document manipulations. It also handles (and that's one of its strong points) many of the math needed for the visualization of data. D3 has a steep learning curve, but once you experiment with it and manage to do simple visualization of some kind of data; the learning process will become much more compelling and interesting. That's the purpose of this post.

D3 handles any kind of document, be it HTML or SVG, and it's not exclusively used to create graphics. That being said, D3 lends itself very well for manipulation of shapes and graphical objects based on static and dynamic data. As such, D3 makes it possible to create very appealing documents.

SVG is one type of document which is often being used with D3. With SVG one can create graphical entities much like creating and styling HTML elements. In this article we will use SVG to visualize our data.

## Structure of data

Data, naturally, has structure. And indeed the way with which D3 handles our data is highly dependent on its structure. Before approaching the task of visualizing our data, we first have to decide on its structure. In D3 our data is no more than a collection of elements with some arbitrary properties which we decide upon. In order to make our code concise and elegant our data needs to be formatted in an efficient way.

For example, think of a collection of circles we want to draw on the screen. Let's say each circle is defined by it's center point coordinates. Each circle also has a radius and a color. How would we represent these circles as datums?

For the sake of this article, lets first describe a tedious way to do it. We will have four arrays - for the x coordinate, y coordinate, radius and color. To represent 3 circles we need the following data:

```Javascript
x = [1, 2, 3]; // x coordinates
y = [1, 3, 2]; // y coordinates
r = [5, 5, 5]; // radius
c = ['red', 'green', 'blue']; // colors
```

Of course a more concise way would be to define a 'circle' object, and have one array of such objects to represent our data. The corresponding array according to this format is:

```Javascript
data = [{
	x: 1,
	y: 1,
	r: 5,
	c: 'red'
}, {
	x: 2,
	y: 3,
	r: 5,
	c: 'green'
}, {
	x: 3,
	y: 2,
	r: 5,
	c: 'blue'
}];
```

Sometimes it's arguable which is the best way to represent our data. But as long as the data has a structure which encapsulates related fields in the same object, we should be OK. After working with D3 for a while you will be able to determine intuitively which structures to avoid and which structures will be better suited to some specific task.

## Visualization of data

Let's continue with the circles example. Now that we have our data, we would like to present it. D3 does not work on individual datums, but rather on data sets. This makes the task of keeping track of changes in data much simpler for us. In the lifespan of our data, there are three types of events:

1. Creation (or 'entering') of data.
2. Changing (or 'updating') existing data.
3. Removing (or 'exiting') existing data.

In order to keep track of our data, we need to provide D3 with some way of uniquely identifying our datums. We will discuss that later. First, we will show how to bind data to DOM elements.

As mentioned before, in this post we will use SVG. So let's start from the top. Let's say our HTML page contains an SVG element which we will use as our canvas:

```HTML
<svg id="canvas"></svg>
```

D3, like many other DOM manipulation libraries, provides us with methods to select DOM elements. Let's select our canvas so we can later add shapes to it:

```Javascript
var canvas = d3.select('#canvas');
```

The next step is to bind our circles data to DOM elements (or SVG shapes in our case).

```Javascript
var circles = canvas
	.selectAll('circle')
	.data(data);
```

Notice that we haven't actually created any new `circle` shapes yet. In the above statement all we do is tell D3 to bind our data array to `circle` SVG elements, **but not actually to create them**. This might be confusing, but the `selectAll` method acts as a selector, **not** as an actual object. And as with all selectors, it will not select anything that does not yet exist. Currently we have only prepared D3 for the possibility of selecting `circle` elements based on our data. We might consider it a virtual selection, as no `circle` elements actually exist yet.

Indeed, in order to have actual `circle` elements, we have to append them to our canvas. Let's do that:

```Javascript
circles
    .enter()
    .append('circle')
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    })
    .attr('fill', function(d){
        return d.c;
    })
    .attr('r', function(d) {
        return d.r;
    });
```

Remember the first type of event in a datum's lifespan - its creation. The creation of new data is referred to as 'entering' in D3. In the above statement we tell D3 that upon entering of new data do the following:

1. Append a new `circle` element.
2. Set some of its attributes.

What the `enter` method does, in effect, is taking the selections (virtual or not) and filtering them such that only selections for new elements remain.

Notice that setting the attributes is done by the return value of a callback function. This function receives an argument `d` (stands for *datum*) which is initialized with the value of the current datum. This allows us to set attributes which depend upon properties of the specific datum which is bound to the element.

The result (check out the [full code](https://github.com/EyalAr/D3.js-Example/blob/master/1.js)):

<iframe src="http://eyalar.github.io/D3.js-Example/index.html?1!0"></iframe>

## Changes in data

Let's say we already have data and the corresponding circles drawn on our canvas; but now some of the data changed:

```Javascript
// change coordinates of the first circle:
data[0].x = 3;
data[0].y = 3;

// add a new circle:
data.push({
	x: 4,
	y: 2,
	r: 5,
	c: 'magenta'
});
```

 We want to reflect those changes in data in our canvas. First, we need to tell D3 about these changes. We saw before how to bind our data with `circle` elements. Let's do that again:

```Javascript
var circles = canvas
	.selectAll('circle')
	.data(data);
```

Unlike the previous time, this time not all of the datums in `data` are new. `data[1]` and `data[2]` represent the same circles as before. `data[0]` is also not new, just changed. `data[3]` is new. This time `selectAll` creates only one virtual selection for the last circle, but three actual selections for the already existing circles. Since only the last circle is new, if we run again `circles.enter()`, only one selection, for the new circle, will remain. So running again the following code will create only one new circle, which is exactly what we want:

```Javascript
circles
    .enter()
    .append('circle')
    // set attributes as before...
```

In order to update the existing circles we simply need to omit the `enter` filter:

```Javascript
// update (x,y) coordinates:
circles
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    });
```

The result ([full code](https://github.com/EyalAr/D3.js-Example/blob/master/2.js)):

<iframe src="http://eyalar.github.io/D3.js-Example/index.html?2!1"></iframe>

Similarly to the `enter` filter, we also have an `exit` filter; which filters the selection only to select elements which are bound to datums that no longer exist. This allows us to handle these 'orphan' elements. We can, for example, remove them from our canvas (and from the document altogether):

```Javascript
circles
    .exit()
    .remove();
```

## Transitions and animations

In the above examples we used the `attr` method to set attributes of selected elements. For better visualization and user experience, we sometimes want to gradually change attributes in a smooth animated way. We can create this experience by gradually setting the attributes from some initial value to a final value. Doing it manually would be tedious; which is why D3 provides us with the `transition` method. Any attribute that is set after we invoke `transition()` on the selection, will be set gradually instead of all at once.

We can use `transition` on our selections as before, and set different transitions for different selections. We might want different effects when new elements are created, than the effects when coordinates are changed.

Rewriting the above examples with transitions:

```Javascript
var circles = canvas
    .selectAll('circle')
    .data(data);

// update (x,y) coordinates of existing elements:
circles
    .transition()
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    });

// create new elements:
circles
    .enter()
    .append('circle')
    // set initial (pre-transition) attributes:
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    })
    .attr('fill', function(d){
        return d.c;
    })
    .attr('r', 0)
    // start transition:
    .transition()
    // set final (post transition) attributes:
    .attr('r', function(d) {
        return d.r;
    });
```

And the result ([full code](https://github.com/EyalAr/D3.js-Example/blob/master/3.js)):

<iframe src="http://eyalar.github.io/D3.js-Example/index.html?3!1"></iframe>

When applying transitions to selections we set one or more attributes of the element to gradually change. All of these attributes will change in this one transition. It's important to note that defining multiple transitions at once is useless, as the last defined transition takes precedence and overrides the others.

So in the following example *transition 1* will not occur:

```Javascript
// transition 1:
circles
    .transition()
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    });

// transition 2:
circles
    .transition()
    .attr('r', function(d) {
        return d.r;
    });

```

The reason for this is Javascript's asynchronous nature, but we will not get into it in this post. In order to chain transitions on the same selection, we will have to make sure that *transition 2* is defined only after *transition 1* ends:

```Javascript
// transition 1:
circles
    .transition()
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    })
    .each('end', function(d){
        // transition 2:
        d3.select(this)
            .transition()
            .attr('r', function(d) {
                return d.r;
            });
    });

```

For this reason, when we defined the `update` and `enter` transitions in the above example; we defined the `enter` transition **after** the `update` transition. We want the `enter` transition of new elements to take precedence over the `update` transition.

## Uniquely identifying datums

Up until now we gave D3 data, but didn't provide it with any method to uniquely identifying datums. When talking about *events* in a datums life, how can D3 know whether a datum changes or if it's not actually a new datum?

By default, D3 identifies a datum by it's index in the `data` array. Usually that's no good. In our circles example, what will happen if we delete all the circles in the `data` array and insert new circles into it? If D3 identifies the circles by their index, then the new circles will be treated as if they were the old ones with updated properties. Although `data[0]` is a whole new circle, as far as D3 is concerned it has the same index as the old circle. In other words, D3 will provide us with `update` selections but no `enter` and `exit` selections as we might want.

See what I mean in the following example:

```Javascript
// reset the `data` array with new circles:
var data = [{
    x: '1.5',
    y: '1.5',
    r: '10',
    c: 'orange'
}, {
    x: '3',
    y: '3',
    r: '10',
    c: 'cyan'
}, {
    x: '4.5',
    y: '4.5',
    r: '10',
    c: 'magenta'
}];

var circles = canvas
    .selectAll('circle')
    .data(data);

// update (x,y) coordinates of existing elements:
circles
    .transition()
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    });

// create new elements:
circles
    .enter()
    .append('circle')
    .attr('cx', function(d) {
        return d.x;
    })
    .attr('cy', function(d) {
        return d.y;
    })
    .attr('fill', function(d) {
        return d.c;
    })
    .attr('r', 0)
    .transition()
    .attr('r', function(d) {
        return d.r;
    });

// remove old elements:
circles
    .exit()
    .transition()
    .attr('r', 0)
    .remove();
```

We might expect D3 to generate `exit` selections for the old circles and remove them from the DOM (after shrinking their radius to 0); and to generate `enter` selections for the new circles. But actually D3 will only generate `update` selections.

Indeed we can see the unexpected result in the following animation ([full code](https://github.com/EyalAr/D3.js-Example/blob/master/4.js)), in which the coordinates of the circles change (as defined in the `update` selection transition); but not the colors and the radiuses (as defined in the `enter` and `exit` selection):

<iframe src="http://eyalar.github.io/D3.js-Example/index.html?4!1"></iframe>

Fixing it is quite easy. All we have to do is provide D3 with a method to uniquely identify the circles. Let's redefine our `data` arrays:

```Javascript
// before:
var data = [{
    id: 'before1',
    x: '1',
    y: '1',
    r: '5',
    c: 'red'
}, {
    id: 'before2',
    x: '2',
    y: '2',
    r: '5',
    c: 'green'
}, {
    id: 'before3',
    x: '3',
    y: '3',
    r: '5',
    c: 'blue'
}];

// after:
// reset the `data` array with new circles:
var data = [{
    id: 'after1',
    x: '1.5',
    y: '1.5',
    r: '10',
    c: 'orange'
}, {
    id: 'after2',
    x: '3',
    y: '3',
    r: '10',
    c: 'cyan'
}, {
    id: 'after3',
    x: '4.5',
    y: '4.5',
    r: '10',
    c: 'magenta'
}];
```

Now each datum has a unique `id` field. But we are not done yet. We need to make D3 use this `id` field to identify our datums. The `data()` method we have seen before takes an optional `key` function just for this purpose:

```Javascript
var circles = canvas
    .selectAll('circle')
    .data(data, function(d, i){
        return d.id;
    });
```

The `key` function takes a datum `d` and the index `i` of the datum in the `data` array (we ignore `i` in this case); and returns an identifier for the datum. Here we use `d.id` as the identifier.

Now the animation works as expected ([full code](https://github.com/EyalAr/D3.js-Example/blob/master/5.js)):

<iframe src="http://eyalar.github.io/D3.js-Example/index.html?5!1"></iframe>

## Final notes

As we have seen in this post, D3 is a very powerful tool which allows us, among other things, to bind data to DOM elements. But D3 is much more than that. It also provides a plethora of tools for working with colors, coordinates, scales, time-driven data and almost anything which one might need to build very elaborate presentations of data.

The focus of this post was not on retrieving data into D3 from external sources; but doing this is not fundamentally different from what we have seen here.

In large applications we often use tools such AngularJS to structure our code and separate logic, views and models. D3 is not there yet, and combining it with libraries such as AngularJS will often seem unnatural. There are some projects trying to close that gap by building D3 Angular directives. Whatever the solution may be, one has to remember that D3 and Angular aim to solve different problems by providing us with different philosophies on how to do things. When I'm building Angular applications which need data visualization; I use Angular to structure and design my app, and D3 inside Angular's logic (controllers, directives, etc.) to manipulate SVG elements outside of Angular's scope.

When building complex animations and presentations with D3 our code can become cumbersome. Redrawing a graph after data changes ofter requires running the same selections and transitions again. It's after a good idea to encapsulate this graph-building code inside functions.

Other resources of information about D3 are abundant in Google. Obviously a good place to start is the official [API reference](https://github.com/mbostock/d3/wiki/API-Reference).

All the examples of this post, including the animation at the top, can be found in [this repository](https://github.com/EyalAr/D3.js-Example).