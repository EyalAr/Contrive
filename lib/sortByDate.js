module.exports = function(params, templates, contexts, links, buffers, done) {

    var moment = require('moment');

    var contar = contexts[links[0].contextPath]._global._contexts; //contexts array

    for (var i = 0; i < contar.length - 1; i++) {
        for (var j = i + 1; j < contar.length; j++) {
            if (comparator(contar[i], contar[j]) < 0) {
                var tmp = contar[i];
                contar[i] = contar[j];
                contar[j] = tmp;
            }
        }
    }

    done();

    // sort in reverse chron order
    // if c1.date == c2.date return 0
    // if c1.date > c2.date return positive int
    // if c1.date < c2.date return negative int
    function comparator(c1, c2) {

        var c1d = moment(c1.date),
            c2d = moment(c2.date);

        return c1d.diff(c2d);

    }

}