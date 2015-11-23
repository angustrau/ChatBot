var fs = require("fs");
var path = require("path");
var log = require("./logging.js")

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

    log.info("Recieved message '" + message + "' of type '" + type + "', id: " + id, info.service);

    plugins.forEach(function(plugin) {
        if (plugin.chatbotEvent) plugin.chatbotEvent(message, type, info, id);
    });
}

function chatNewBroadcaster(callback) {
    chats.push(callback);
}

log.info("ChatBot v1.2".bold, "ChatBot");
log.info("By Angus Trau", "ChatBot");
console.log("");

log.info("Loading providers...", "ChatBot")
var providerFiles = fs.readdirSync("providers");
providerFiles.forEach(function(filename) {
    if (fs.lstatSync("providers/" + filename).isDirectory() || path.extname(filename) != ".js") return;

    log.info("Loading " + filename + "...", "ChatBot");
    var provider = require("./providers/" + filename);

    if (provider.chatbotInit) provider.chatbotInit(chatRecieve);

    providers.push(provider);

    log.info("Loaded " + filename, "ChatBot");
});
log.info("Loaded providers", "ChatBot");

log.info("Loading plugins...", "ChatBot");
var pluginFiles = fs.readdirSync("plugins");
pluginFiles.forEach(function(filename) {
     if (fs.lstatSync("plugins/" + filename).isDirectory() || path.extname(filename) != ".js") return;

     log.info("Loading " + filename + "...", "ChatBot");
     var plugin = require("./plugins/" + filename);

     if (plugin.chatbotInit) plugin.chatbotInit(chatBroadcast);

     plugins.push(plugin);

     log.info("Loaded " + filename, "ChatBot");
});
log.info("Loaded plugins", "ChatBot");
console.log("");