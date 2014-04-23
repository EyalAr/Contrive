var fs = require('fs'),
    async = require('async');

async.waterfall([

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
                contexts: [
                    join(concoction.metadata, "./*.json"),
                    concoction.globals
                ],
                dest: concoction.build,
                linkingRules: {},
                plugins: []
            };

            options['linkingRules'][join(concoction.metadata, "./*.json")] = join(concoction.theme, "./templates/post.tpl");
            options['linkingRules'][concoction.globals] = join(concoction.theme, "./templates/index.tpl");

            next(null, concoction, options);

        },

        // step 3: inject internal plugins
        function(concoction, options, next) {

            options.plugins.push({
                name: 'global-context-generator',
                handler: require('./lib/globalContext'),
                params: {
                    globalsPath: concoction.globals
                }
            });

            options.plugins.push({
                name: 'sort-by-date',
                handler: require('./lib/sortByDate')
            });

            options.plugins.push({
                name: 'date-formatter',
                handler: require('./lib/dateFormatter'),
                params: {
                    format: concoction.dateFormat || 'LLLL'
                }
            });

            next(null, concoction, options);

        },

        // step 5: inject external plugins:
        function(concoction, options, next) {

            var join = require('path').join;

            options.plugins.push({
                name: 'concoct-copy',
                handler: require('concoct-copy'),
                params: {
                    src: join(concoction.theme, "./static"),
                    dest: concoction.build
                }
            });

            options.plugins.push({
                name: 'concoct-content-loader',
                handler: require('concoct-content-loader'),
                params: {
                    srcField: 'file',
                    contentField: '_content',
                    strict: false
                }
            });

            options.plugins.push({
                name: 'concoct-markdown',
                handler: require('concoct-markdown'),
                params: {
                    fields: '_content',
                    highlight: true
                }
            });

            options.plugins.push({
                name: 'concoct-named-buffers',
                handler: require('concoct-named-buffers'),
                params: {
                    destField: 'slug',
                    postfix: '.html'
                }
            });

            options.plugins.push({
                name: 'concoct-mustache',
                handler: require('concoct-mustache')
            });

            next(null, options);

        },

        // step 4: start ConcoctJS:
        function(options, next) {

            var Concoct = require('concoct');
            var c = new Concoct(options);
            c.concoct(next);

        }

    ],
    function(err) {

        if (err) {
            console.error(err);
        } else {
            console.log('Done.')
        }

    });