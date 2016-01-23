var CONTROL_OVERRIDE = "++";
var CONTROL_OVERRIDE_DEDENT = "*+";
var CONTROL_TYPE = ":";
var CONTROL_PART = "+";
var INDENT = "    ";

module.exports.packStrings = function(input, output, options) {
    return packLines(
        input.split(/\r\n|\n|\r/),
        output.split(/\r\n|\n|\r/),
        options
    ).join("\n");
};

module.exports.unpackString = function(packed, options) {
    return unpackLines(
        packed.split(/\r\n|\n|\r/),
        options
    ).join("\n");
};

function packLines(input, output, options) {
    var results = [];
    for (var i = 0; i < input.length; i++) {
        if (output[i] == null
            || output[i].indexOf("/*" + CONTROL_TYPE) > -1
            || output[i].indexOf("/*" + CONTROL_PART) > -1
            || output[i].indexOf("/*" + CONTROL_OVERRIDE_DEDENT) > -1
            || output[i].indexOf("/*" + CONTROL_OVERRIDE) > -1) {
            results.push(quoteLine(input[i], output[i]));
            continue;
        }
        if (input[i] === output[i]) {
            results.push(input[i]);
            continue;
        }
            
        var packed = packLineParts(input[i], output[i], options);
        if (packed) {
            results[i] = packed;
            continue;
        }
        
        // TODO: input and output too different, continue on different input line?
        results.push(quoteLine(input[i], output[i]));
    }
    for (var i = input.length; i < output.length; i++) {
        results.push(quoteLine(null, output[i]));
    }
    return results;
}

function packLineParts(input, output, options) {
    options = options || {};
    
    var result = packOpenPart(input, output, "", 0, 0);
    if (!result)
        return;
    // TODO: optimize - strip spaces early on
    if (options.stripSpaces)
        result = result.replace(/\*\/ \/\*[:\+]/g, " ");
    return result;
    
    function packOpenPart(input, output, inputStart, outputStart) {
        if (output.length > input.length)
            return;
        for (var i = 0; inputStart + i < input.length; i++) {
            if (input[inputStart + i] === output[outputStart + i])
                continue;
            var prefix = input.substring(inputStart, inputStart + i);
            return packClosePart(input, output, inputStart + i, outputStart + i, prefix);
        }
        return input.substr(inputStart);
    }

    function packClosePart(input, output, inputStart, outputStart, prefix) {
        var nextChar = output[outputStart];
        
        if (nextChar === undefined)
            return prefix + quotePart(input.substr(inputStart));
        
        var inputEnd = input.length + 1;
        debug("looking for " + outputStart + ":'" + nextChar + "' @ " + inputStart + ".." + inputEnd + " --- prefix " + prefix);
        for (;;) {
            var inputMatch = input.lastIndexOf(nextChar, inputEnd);
            if (inputMatch === -1 || inputMatch < inputStart) {
                debug("  backtrack: no match at " + inputMatch + "<" + inputStart + ":" + input[inputMatch]);
                break;
            }
            var tail = packOpenPart(input, output, inputMatch, outputStart);
            if (tail)
                return prefix + quotePart(input.substring(inputStart, inputMatch)) + tail;
            inputEnd = inputMatch - 1;
        }
        
        // Couldn't find a char matching nextChar :(
        // if it's a space, we'll skip it; otherwise end of the line!
        if (nextChar === " ") {
            debug("  backtrack: skipping space");
            return packClosePart(input, output, inputStart, outputStart + 1, prefix);
        }
    }
}

function unpackLines(packed, options) {
    var results = [];
    var PREFIX_OVERRIDE = "/*" + CONTROL_OVERRIDE;
    var PREFIX_OVERRIDE_DEDENT = "/*" + CONTROL_OVERRIDE_DEDENT;
    for (var i = 0; i < packed.length; i++) {
        var line = packed[i];
        
        if (line.indexOf(PREFIX_OVERRIDE) === 0) {
            var end = line.indexOf("*/");
            if (end === PREFIX_OVERRIDE.length)
                continue;
            var part = packed[i].substring(PREFIX_OVERRIDE.length, end);
            results.push(unquotePart(part));
            continue;
        }
        
        if (line.indexOf(PREFIX_OVERRIDE_DEDENT) === 0) {
            var end = line.indexOf("*/");
            if (end === PREFIX_OVERRIDE_DEDENT.length)
                continue;
            var part = packed[i].substring(PREFIX_OVERRIDE_DEDENT.length, end);
            results.push(INDENT + unquotePart(part));
            continue;
        }
        
        var startQuote;
        while ((startQuote = line.indexOf("/*" + CONTROL_PART)) > -1) {
            var endQuote = line.indexOf("*/", startQuote + 3);
            line = line.substr(0, startQuote)
                + unquotePart(line.substring(startQuote + 3, endQuote))
                + line.substr(endQuote + 2);
        }
        while ((startQuote = line.indexOf("/*" + CONTROL_TYPE)) > -1) {
            var endQuote = line.indexOf("*/", startQuote + 3);
            line = line.substr(0, startQuote )
                + unquotePart(line.substring(startQuote + 2, endQuote))
                + line.substr(endQuote + 2);
        }
        results.push(line);
    }
    return results;
}

function debug(args) {
    // console.log.apply(console, arguments);
}

function quoteLine(input, output) {
    output = output || "";
    if (input === "")
        return "/*" + CONTROL_OVERRIDE + "\\n" + "*/" + output;
    if (!input)
        return "/*" + CONTROL_OVERRIDE + "*/" + output;
    if (input.substr(0, 4) === INDENT)
        return quotePart(input.substr(4), CONTROL_OVERRIDE_DEDENT) + output.trim();
    return quotePart(input, CONTROL_OVERRIDE) + output;
}

function quotePart(part, controlCode) {
    if (!part)
        return "";
    if (!controlCode && part[0] === CONTROL_TYPE) {
        part = part.substr(1);
        controlCode = CONTROL_TYPE;
    }
    if (!controlCode) {
        controlCode = CONTROL_PART;
    }
    
    return "/*"
        + controlCode
        + part.replace(/\\/g, "\\\\")
              .replace(/\+/g, "\\+")
              .replace(/\//g, "\\/")
        + "*/";
}

function unquotePart(part) {
    return part.replace(/^\\n$/, "")
               .replace(/\\\\/g, "\\")
               .replace(/\\\+/g, "+")
               .replace(/\\\//g, "/");
}