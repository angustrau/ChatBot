module.exports = function(command, args) {
    if (command == "echo") {
        var echo = ""
        args.forEach(function(arg) {
            echo = echo + arg + " ";
        });
        return "[Echo] " + echo;
    } else {
        return null;
    }    
}