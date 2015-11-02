#!/usr/bin/env node
var optimist = require("optimist");
var fs = require("fs");
var jstransform = require("jstransform/simple");
var transform = require("./transform");

var args = optimist
    .usage('Compile or decompile teascript files\nUsage: teascript.js <-c FILE|-d FILE>')
    .alias('c', 'compile')
    .describe('c', 'Compile a file')
    .alias('d', 'decompile')
    .describe('d', 'Decompile a file')
    .alias('h', 'help')
    .describe('help', 'Show help')
    .argv;

if (args.help || (!args.compile && !args.decompile)) {
    args.showHelp();
    process.exit();
}

var source = args.compile || args.decompile;
if (source === true)
    source = "/dev/stdin";
var file = fs.readFileSync(source, "utf8");
var result;

if (args.decompile) {
    result = transform.unpackString(file);
}
else if (args.compile) {
    var compiled = jstransform.transform(file, {
        stripTypes: true,
        es6: true
    });
    result = transform.packStrings(file, compiled.code, { stripSpaces: true });
}

console.log(result);