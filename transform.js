var CONTROL_INPUT = "::";

module.exports.packStrings = function(input, output, options) {
    return packLines(
        input.split(/\r\n|\n|\r/),
        output.split(/\r\n|\n|\r/),
        options
    ).join("\n");
};

function packLines(input, output, options) {
    var results = [];
    for (var i = 0; i < input.length; i++) {
        if (input[i] === output[i]) {
            results.push(input[i]);
            continue;
        }
        if (output[i] == null) {
            results.push(quoteLine(input[i], null));
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
        results.push(quoteLine("", output[i]));
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
        result = result.replace(/\*\/ \/\*:/g, " ");
    return result;
    
    function packOpenPart(input, output, inputStart, outputStart) {
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
    for (var i = 0; i < packed.length; i++) {
        var line = packed[i];
        if (line.indexOf("/*:" + CONTROL_INPUT) === 0) {
            
        }
    }
}

function debug(args) {
    // console.log.apply(console, arguments);
}

function quoteLine(input, output) {
    output = output || "";
    return input != null
        ? quotePart(CONTROL_INPUT + input) + output
        : output;
}

function quotePart(part) {
    return part
        ? "/*:" + part.replace(/\\/g, "\\\\").replace(/\//g, "\\/") + "*/"
        : "";
}