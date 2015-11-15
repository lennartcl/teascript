var transform = require("./transform");
var jstransform = require("jstransform/simple");

module.exports.decompile = function(input) {
    return transform.unpackString(input);
};

module.exports.compile = function(input, options) {
    if (options.stripTypes === undefined)
        options.stripTypes = true;
    var compiled = jstransform.transform(input, options);
    return transform.packStrings(input, compiled.code, { stripSpaces: true });
};

module.exports.transform = transform;