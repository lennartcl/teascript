var transform = require("./transform");
var assert = require("assert-diff");
var jstransform = require("jstransform/simple");

var assertPack = module.exports.assertPack = function(input, output, expected) {
    var packed = transform.packStrings(input, output, { stripSpaces: true });
    assert.equal(packed, expected, "bad pack");
    var unpacked = transform.unpackString(packed);
    assert.equal(unpacked, input, "bad unpack");
};

module.exports.assertJST = function(input, packed) {
    var output = jstransform.transform(input, {
        stripTypes: true,
        es6: true,
    }).code;
    assertPack(input, output, packed);
};