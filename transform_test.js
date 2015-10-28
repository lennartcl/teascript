#!/usr/bin/env node
/*global describe it*/

var assertPack = require("./test_util").assertPack;

describe("Transform", function(){
    it("handles base case 1", function() {
        assertPack(
            "foobar",
            "foo   ",
            "foo/*:bar*/"
        );
    });
    it("handles base case 2", function() {
        assertPack(
            "foobar",
            "foo",
            "foo/*:bar*/"
        );
    });
    it("handles base case 3", function() {
        assertPack(
            "foo DELME bar",
            "foo bar",
            "foo /*:DELME */bar"
        );
    });
    it("handles base case 4", function() {
        assertPack(
            "foo DELME bar METOO",
            "foo bar",
            "foo /*:DELME */bar/*: METOO*/"
        );
    });
    it.skip("handles added lines", function() {
        assertPack(
            "foo\nbar",
            "foo",
            "foo\n/*::bar*/"
        );
    });
    it("should transform types stripped as spaces", function() {
        assertPack(
            "function foo(a: string, b: number): void {",
            "function foo(a        , b        )       {",
            "function foo(a/*:: string*/, b/*:: number*/)/*:: void*/ {"
        );
    });
});