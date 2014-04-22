var options = {
    templates: ['./templates/*.tpl'],
    contexts: ['./content/*.json'],
    dest: './build',
    linkingRules: {
        './content/*.json': './templates/post.tpl'
    },
    plugins: [{
        name: 'concoct-copy',
        handler: require('concoct-copy'),
        params: {
            src: './static',
            dest: './build'
        }
    }, {
        name: 'concoct-content-loader',
        handler: require('concoct-content-loader'),
        params: {
            srcField: 'file',
            contentField: '_content'
        }
    }, {
        name: 'concoct-markdown',
        handler: require('concoct-markdown'),
        params: {
            fields: '_content',
            highlight: true
        }
    }, {
        name: 'concoct-named-buffers',
        handler: require('concoct-named-buffers'),
        params: {
            destField: 'slug',
            postfix: '.html'
        }
    }, {
        name: 'concoct-mustache',
        handler: require('concoct-mustache')
    }]
};

var Concoction = require('concoct');
var c = new Concoction(options);

c.concoct(function(err){
    if (err) console.log(err);
    console.log('done');
});