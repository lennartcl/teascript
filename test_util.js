var transform = require("./transform");
var assert = require("assert-diff");
var jstransform = require("jstransform/simple");

var assertPack = module.exports.assertPack = function(before, after, expected) {
    var packed = transform.packStrings(before, after, { stripSpaces: true });
    assert.equal(packed, expected);
};

module.exports.assertJST = function(before, packed) {
    var after = jstransform.transform(before, {
        stripTypes: true,
        es6: true,
    });
    assertPack(before, after, packed);
};