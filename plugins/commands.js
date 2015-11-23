var fs = require("fs");
var path = require("path");
var log = require("../logging.js");
var plugins = [];

var pluginFiles = fs.readdirSync("Plugins/commands");
pluginFiles.forEach(function(filename) {
    if (fs.lstatSync("plugins/commands/" + filename).isDirectory() || path.extname("commands/" + filename) != ".js") return;
    
    var plugin = require("./commands/" + filename);
    if (!plugin) return;

    log.info("Loaded " + filename, "Commands");
    
    plugins.push(plugin); 
});

exports.chatbotEvent = function(message, type, info, id) {
    if (type != "text") return;

    if (message.charAt(0) != "!") return;

    message = message.slice(1);
    var args = message.split(" ");
    var command = args[0].toLowerCase();
    args.shift();

    var validCommand = false;

    for (i=0;i<plugins.length;i++) {
        var result = plugins[i](command, args); 
        
        if (result) {
            info.handler(result, id);
            validCommand = true;
            break;
        }  
    }

    //if (!validCommand) info.handler("Command not recognised", id);
}