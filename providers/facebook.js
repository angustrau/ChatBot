var login = require("./facebook/index.js");

var recieveHandler;
var config = {};
var Facebook;
var stopListening;

function getInfoTemplate(message) {
    var info = {
        "handler":sendMessage,
        "service":"facebook",
        "raw":message,
        "name":message.senderName,
        "username":message.senderID
    }
    return info    
}

function sendMessage(message, id) {
    Facebook.sendMessage(message, id);
    console.log("[Facebook] Sent message '" + message + "' to " + id);
}

exports.chatbotInit = function(chatRecieve) {
    recieveHandler = chatRecieve;

    config = require("./facebook.json");

    if (!config.email || !config.password) {
        console.log("[Facebook] Email or password not provided, module disabled");
        return;    
    }

    login(config, function(err, api) {
        if (err) return console.log("[Facebook] Error logging in");

        Facebook = api;

        console.log("[Facebook] Logged in as " + config.email);

        //api.setOptions({"listenEvents":true, "updatePresence":true});

        stopListening = api.listen(function(err, message) {
            if (err) return console.log("[Facebook] Error in listen event");

            switch(message.type) {
                case "message":
                    recieveHandler(message.body, "text", getInfoTemplate(message), message.threadID)
                    break;
                case "presence":
                    //offline messages are not consistent
                    break;
                case "event":
                case "typ":
                    recieveHandler(message.isTyping, "facebook_isTyping", getInfoTemplate(message), message.threadID)
                    break;
            }
        });
    });
}