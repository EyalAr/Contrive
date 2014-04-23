// 1. create an array in the 'globals' context globals._contexts = [] which contains references to all context objects
// 2. create a '_global' field in all contexts which references the global context

module.exports = function(params, templates, contexts, links, buffers, done) {

    var rel = function(p) {
        return require('path').relative(process.cwd(), p);
    };

    var globals = contexts[rel(params.globalsPath)];
    globals._contexts = [];

    Object.keys(contexts).forEach(function(c) {
        if (c !== rel(params.globalsPath)) {
            globals._contexts.push(contexts[c]);
        }
        contexts[c]._global = globals;
    });

    done();

}