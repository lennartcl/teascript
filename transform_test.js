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
    it("should transform types stripped as spaces", function() {
        assertPack(
            "function foo(a: string, b: number): void {",
            "function foo(a        , b        )       {",
            "function foo(a/*:: string*/, b/*:: number*/)/*:: void*/ {"
        );
    });
    it("handles extra lines in input", function() {
        assertPack(
            "foo\nDELME",
            "foo",
            "foo\n/*:DELME*/"
        );
    });
    it("copes with extra lines in output", function() {
        assertPack(
            "foo",
            "foo\nEXTRA",
            "foo\n/*:$HIDE$*/EXTRA"
        );
    });
    it("doesn't touch unchanged lines", function() {
        assertPack(
            "foo\nbar",
            "foo\nbar",
            "foo\nbar"
        );
    });
});