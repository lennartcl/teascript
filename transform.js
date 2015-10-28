

module.exports.packStrings = function(before, after, options) {
    return packLines(
        before.split(/\r\n|\n|\r/),
        after.split(/\r\n|\n|\r/),
        options
    ).join(/\n/);
};

function packLines(before, after, options) {
    for (var i = 0; i < before.length; i++) {
        if (before[i] === after[i])
            continue;
        after[i] = packLineParts(before[i], after[i], options);
    }
    return after;
}

function packLineParts(before, after, options) {
    options = options || {};
    
    if (!before)
        return quoteLine(after);
    if (!after)
        return before;
    
    var result = packOpenPart(before, after, "", 0, 0) || quoteLine(after);
    if (options.stripSpaces)
        result = result.replace(/\*\/ \/\*:/g, " ");
    return result;
    
    function packOpenPart(before, after, beforeStart, afterStart) {
        for (var i = 0; beforeStart + i < before.length; i++) {
            if (before[beforeStart + i] === after[afterStart + i])
                continue;
            var prefix = before.substring(beforeStart, beforeStart + i);
            return packClosePart(before, after, beforeStart + i, afterStart + i, prefix);
        }
        return before.substr(beforeStart);
    }

    function packClosePart(before, after, beforeStart, afterStart, prefix) {
        var nextChar = after[afterStart];
        
        if (nextChar === undefined)
            return prefix + quotePart(before.substr(beforeStart));
        
        var beforeEnd = before.length + 1;
        debug("looking for " + afterStart + ":'" + nextChar + "' @ " + beforeStart + ".." + beforeEnd + " --- prefix " + prefix);
        for (;;) {
            var beforeMatch = before.lastIndexOf(nextChar, beforeEnd);
            if (beforeMatch === -1 || beforeMatch < beforeStart) {
                debug("  backtrack: no match at " + beforeMatch + "<" + beforeStart + ":" + before[beforeMatch]);
                break;
            }
            var tail = packOpenPart(before, after, beforeMatch, afterStart);
            if (tail)
                return prefix + quotePart(before.substring(beforeStart, beforeMatch)) + tail;
            beforeEnd = beforeMatch - 1;
        }
        
        // Couldn't find a char matching nextChar :(
        // if it's a space, we'll skip it; otherwise end of the line!
        if (nextChar === " ") {
            debug("  backtrack: skipping space");
            return packClosePart(before, after, beforeStart, afterStart + 1, prefix);
        }
    }
}

function debug(args) {
    // console.log.apply(console, arguments);
}

function quoteLine(before, after) {
    return after
        ? "/*::" + after + "*/" + before
        : before;
}

function quotePart(part) {
    return part
        ? "/*:" + part + "*/"
        : "";
}