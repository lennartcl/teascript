

module.exports.packStrings = function(input, output, options) {
    return packLines(
        input.split(/\r\n|\n|\r/),
        output.split(/\r\n|\n|\r/),
        options
    ).join("\n");
};

function packLines(input, output, options) {
    for (var i = 0; i < input.length; i++) {
        if (input[i] === output[i])
            continue;
        output[i] = packLineParts(input[i], output[i], options);
    }
    return output.filter(function(line) {
        return line != null;
    });
}

function packLineParts(input, output, options) {
    options = options || {};
    
    if (!output)
        return quoteLine(input, output);
    if (!input)
        return null;
    
    var result = packOpenPart(input, output, "", 0, 0) || quoteLine(output);
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

function debug(args) {
    // console.log.apply(console, arguments);
}

function quoteLine(input, output) {
    return output
        ? "/*::" + output + "*/" + input
        : input;
}

function quotePart(part) {
    return part
        ? "/*:" + part + "*/"
        : "";
}