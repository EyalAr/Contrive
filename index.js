var fs = require('fs'),
    async = require('async');

async.series([

    // step 1: read concoction.json
    function(next) {

        fs.readFile('./concoction.json', {
            encoding: 'utf8'
        }, next);

    },

    // step 2: prepare options
    function(data, next) {

        var join = require('path').join,
            concoction;

        try {
            concoction = JSON.parse(data);
        } catch (e) {
            return next("Invalid JSON in concoction.json");
        }

        var options = {
            templates: [
                join(concoction.theme, "./templates/post.tpl"),
                join(concoction.theme, "./templates/index.tpl"),
            ],
            contexts: join(concoction.metadata, "./*.json"),
            dest: concoction.build,
            linkingRules: {
                join(concoction.metadata, "./*.json"): join(concoction.theme, "./templates/post.tpl")
            },
            plugins: [{
                name: 'concoct-copy',
                handler: require('concoct-copy'),
                params: {
                    src: join(concoction.theme, "./static"),
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

        next(null, options);

    }

], function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log('Done.')
    }
});

var Concoction = require('concoct');
var c = new Concoction(options);

c.concoct(function(err) {
    if (err) console.log(err);
    console.log('done');
});