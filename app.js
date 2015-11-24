var fs = require("fs");
var path = require("path");
var log = require("./logging.js")

var providers = {};
var plugins = [];
var chats = [];

function chatBroadcast(message) {
    //non functional
    chats.forEach(function(callback) {
        callback(message); 
    });
}

function chatRecieve(message, type, info, id) {
    type = type || "text";

    info.provider = providers[info.service];

    log.info("Recieved message '" + message + "' of type '" + type + "', id: " + id, info.service + " --> message reciever");

    plugins.forEach(function(plugin) {
        if (plugin.chatbotEvent) plugin.chatbotEvent(message, type, info, id); //Called when a message is recieved
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

    if (provider.chatbotInit) provider.chatbotInit(chatRecieve); //Called on init. Passes a callback for when a message is recieved

    providers[provider.name] = provider;

    log.info("Loaded " + filename, "ChatBot");
});
log.info("Loaded providers", "ChatBot");

log.info("Loading plugins...", "ChatBot");
var pluginFiles = fs.readdirSync("plugins");
pluginFiles.forEach(function(filename) {
     if (fs.lstatSync("plugins/" + filename).isDirectory() || path.extname(filename) != ".js") return;

     log.info("Loading " + filename + "...", "ChatBot");
     var plugin = require("./plugins/" + filename);

     if (plugin.chatbotInit) plugin.chatbotInit(chatBroadcast); //Called on init. Passes a callback to broadcast a message to all open chats
     if (plugin.chatbotProviders) plugin.chatbotProviders(providers); //Passes providers to a plugin if requested

     plugins.push(plugin);

     log.info("Loaded " + filename, "ChatBot");
});
log.info("Loaded plugins", "ChatBot");
console.log("");