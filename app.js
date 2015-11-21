console.log("ChatBot v1.2");
console.log("By Angus Trau");
console.log("");

var fs = require("fs");
var path = require("path");

var providers = [];
var plugins = [];
var chats = [];

function chatBroadcast(message) {
    chats.forEach(function(callback) {
        callback(message); 
    });
}

function chatRecieve(message, type, info, id) {
    type = type || "text";

    console.log("Recieved message '" + message + "' of type '" + type + "' from " + info.service);

    plugins.forEach(function(plugin) {
        plugin.chatbotEvent(message, type, info, id);
    });
}

function chatNewBroadcaster(callback) {
    chats.push(callback);
}

console.log("Loading providers...")
var providerFiles = fs.readdirSync("providers");
providerFiles.forEach(function(filename) {
    if (fs.lstatSync("providers/" + filename).isDirectory() || path.extname(filename) != ".js") return;

    console.log("Loading " + filename + "...");
    var provider = require("./providers/" + filename);

    if (provider.chatbotInit) {
        provider.chatbotInit(chatRecieve);
    } else {
        return;
    };

    providers.push(provider);

    console.log("Loaded " + filename);
});
console.log("Loaded providers");

console.log("Loading plugins...");
var pluginFiles = fs.readdirSync("plugins");
pluginFiles.forEach(function(filename) {
     if (fs.lstatSync("plugins/" + filename).isDirectory() || path.extname(filename) != ".js") return;

     console.log("Loading " + filename + "...");
     var plugin = require("./plugins/" + filename);

     if (!plugin.chatbotEvent) return;

     if (plugin.chatbotInit) plugin.chatbotInit(chatBroadcast);

     plugins.push(plugin);

     console.log("Loaded " + filename);
});
console.log("Loaded plugins");