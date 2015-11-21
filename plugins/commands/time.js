module.exports = function(command, args) {
    if (command == "time") {
        return Date();
    } else {
        return null;
    }    
}