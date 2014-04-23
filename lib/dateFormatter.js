module.exports = function(params, templates, contexts, links, buffers, done) {

    var moment = require('moment');

    Object.keys(contexts).forEach(function(c) {

        var context = contexts[c];

        if (context.date) {
            context.date = moment(context.date).format(params.format);
        }

    });

    done();

}