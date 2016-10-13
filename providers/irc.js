exports.name = "irc"; //has to be the same as "service"

var irc = require("./irc/node_modules/irc");
var log = require("../logging.js");

var recieveHandler
var config = {};
var client;
var channels = [];

function getInfoTemplate(message) {
    var info = {
        "handler":sendMessage,
        "service":"irc", //Has to be the same as exports.name
        "api":Facebook,
        "raw":message,
        "name":message.senderName,
        "username":message.senderID
    }
    return info    
}

function sendMessage(message, id) {
    client.say(id, message);
    log.info("Sent message '" + message + "' to " + id, "IRC");
}

exports.send = sendMessage;

exports.chatbotInit = function(chatRecieve) {
    recieveHandler = chatRecieve;

    config = require("./irc.json");

    if (config.server == "" || !config.port || config.nick == "" || config.username == "" || config.realname == "") {
        log.error("Config is not complete, module disabled", "IRC");
        return;
    }

    channels = require("./irc/channels.json").channels;

    client = new irc.Client(config.server, config.nick, {
        autoRejoin:true,
        channels:channels,
        stripColors:true
    });

    client.addListener("message", function(from, to, message) {
        
    });

    client.addListener("registered", function(message) {
         
    });

    client.addListener("error", function(message) {
        log.error(message, "IRC"); 
    });
}