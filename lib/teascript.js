var transform = require("./transform");
var childProcess = require("child_process");
var readline = require("readline");
var fs = require("fs");

module.exports.decompile = function(file, callback) {
    callback(null, transform.unpackString(file));
};

module.exports.compile = function(file, command, args, callback) {
    spawnOrFork(command, args, function(err, proc) {
        if (err) return callback(err);
        
        var result = "";
        proc.stdout.on("data", function(chunk) {
            result += chunk;
        });
        proc.on("close", function(code) {
            if (code) return callback("Process exited with error " + code);
            callback(null, transform.packStrings(file, result, { stripSpaces: true }));
        });
        // proc.stdin.setEncoding("utf8");
        // proc.stdin.write(file.replace(/\n?$/, "\n"));
    });
};

function spawnOrFork(command, args, callback) {
    isNodeFile(command, function(err, useFork) {
        if (err) return callback(err);
        
        var result;
        try {
            result = useFork && false // TODO
                ? childProcess.fork(command, args, { silent: true })
                : childProcess.spawn(command, args);
        } catch (e) {
            return callback(e);
        }
        callback(null, result);
    });
}

function isNodeFile(command, callback) {
    getFileHeader(command, function(err, result) {
        if (err) return callback(err);
        
        return callback(null, /\bnode\b/.test(result));
    });
}

function getFileHeader(command, callback) {
    childProcess.execFile("which", [command], function(err, result) {
        if (err) return callback(new Error("Unable to find command: " + command));
        
        var commandFile = result.replace(/\n$/, "");

        var lineReader = readline.createInterface({
            input: fs.createReadStream(commandFile)
        });
        
        lineReader.once("line", function(line) {
            lineReader.close();
            callback(null, line);
        });
    });
}


module.exports.transform = transform;