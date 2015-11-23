var fs = require("fs");
var SkywebUtils = require('./skype/dist/skyweb/utils.js');
var SkywebLib = require("./skype/dist/skyweb/skyweb.js");
var Skyweb = new SkywebLib();
var log = require("../logging.js");

var recieveHandler;
var config = {};

function getInfoTemplate(message) {
    var username = message.resource.from.split("/");
    var info = {
        "handler":sendMessage,
        "service":"skype",
        "api":Skyweb,
        "raw":message,
        "name":message.resource.imdisplayname,
        "username":username[username.length - 1].slice(2)
    }
    return info    
}

function sendMessage(message, id) {
    Skyweb.sendMessage(id, message);
}

Skyweb.messagesCallback = function(messages) {
    messages.forEach(function(message) {
        if (message.resource.from.indexOf(config.username) === -1 && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping') {
            var conversationLink = message.resource.conversationLink;
	        var conversationId = conversationLink.substring(conversationLink.lastIndexOf('/') + 1);
            recieveHandler(message.resource.content, "text", getInfoTemplate(message), conversationId);
        }
    });
}

Skyweb.authRequestCallback = function(requests) {
    //accept all requests
    requests.forEach(function(request) {
        Skyweb.acceptAuthRequest(request.sender);
        log.info("Contact request from " + request.sender + " has been accepted", "Skype");

        setTimeout(function() {
            Skyweb.sendMessage("8:" + request.sender, "Hello!");
         }, 5000);
    });   
}

exports.chatbotInit = function(chatRecieve) {
    recieveHandler = chatRecieve;

    config = require("./skype.json");

    if (!config.username || ! config.password) {
        log.error("Username or password not provided, module disabled", "Skype");
        return;    
    }

    Skyweb.login(config.username, config.password)
        .then(function(account) {
            log.info("Logged in as " + account.username, "Skype");
        });
}