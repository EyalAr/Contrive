module.exports = function(params, templates, contexts, links, buffers, done) {

    var moment = require('moment');

    Object.keys(contexts).forEach(function(c) {

        var context = contexts[c];

        if (context.date) {

            // fix for https://github.com/moment/moment/issues/1619
            if (!isNaN(parseInt(context.date.month))) {
                context.date.month = +context.date.month - 1;
            }

            context.date = moment(context.date).format(params.format);
        }

    });

    done();

}