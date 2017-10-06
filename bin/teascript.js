#!/usr/bin/env node
var optimist = require("optimist");
var fs = require("fs");
var teascript = require("../lib/teascript");

var args = optimist
    .usage('Compile or decompile teascript files\nUsage: teascript.js [-i FILE] [-o FILE] <-c COMMAND [ARGS...] | -d>')
    .alias('i', 'input')
    .describe('i', 'Input file')
    .alias('o', 'output')
    .describe('o', 'Output file')
    .alias('c', 'compile')
    .describe('c', 'Compile a file')
    .alias('d', 'decompile')
    .describe('d', 'Decompile a file')
    .alias('h', 'help')
    .describe('help', 'Show help')
    .argv;

if (args.help || (!args.compile && !args.decompile)) {
    optimist.showHelp();
    process.exit();
}

var file = fs.readFileSync(args.input || "/dev/stdin", "utf8");

if (args.decompile) {
    teascript.decompile(file, done);
} else {
    teascript.compile(file, args.compile, args._, done);
}

function done(err, result) {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }
    if (!args.output)
        return console.log(result);
    return fs.writeFileSync(args.output, result, "utf8");
}