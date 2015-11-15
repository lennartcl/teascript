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
    .describe(
      '--react',
      'Turns on the React JSX and React displayName transforms'
    ).describe(
      '--es6',
      'Turns on available ES6 transforms'
    ).describe(
      '--es7',
      'Turns on available ES7 transforms'
    ).describe(
      '--harmony',
      'Shorthand to enable all ES6 and ES7 transforms'
    ).describe(
      '--utility',
      'Turns on available utility transforms'
    ).describe(
      '--target [version]',
      'Specify your target version of ECMAScript. Valid values are "es3" and ' +
      '"es5". The default is "es5". "es3" will avoid uses of defineProperty and ' +
      'will quote reserved words. WARNING: "es5" is not properly supported, even ' +
      'with the use of es5shim, es5sham. If you need to support IE8, use "es3".',
      'es5'
    /* Enabled by default:
    ).describe(
      '--strip-types',
      'Strips out type annotations.'
    */
    ).describe(
      '--es6module',
      'Parses the file as a valid ES6 module. ' +
      '(Note that this means implicit strict mode)'
    ).describe(
      '--non-strict-es6module',
      'Parses the file as an ES6 module, except disables implicit strict-mode. ' +
      '(This is useful if you\'re porting non-ES6 modules to ES6, but haven\'t ' +
      'yet verified that they are strict-mode safe yet)'
    /* Not supported:
    ).describe(
      '--source-map-inline',
      'Embed inline sourcemap in transformed source'
    */
    ).describe(
      '--source-filename',
      'Filename to use when generating the inline sourcemap. Will default to ' +
      'filename when processing files'
    )
    .argv;

if (args.help || (!args.compile && !args.decompile)) {
    optimist.showHelp();
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
    if (args.stripTypes === undefined)
        args.stripTypes = true;
    var compiled = jstransform.transform(file, args);
    result = transform.packStrings(file, compiled.code, { stripSpaces: true });
}

console.log(result);