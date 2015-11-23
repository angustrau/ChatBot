exports.name = "facebook"; //has to be the same as "service"

var login = require("./facebook/index.js");
var log = require("../logging.js");

var recieveHandler;
var config = {};
var Facebook;
var stopListening;

function getInfoTemplate(message) {
    var info = {
        "handler":sendMessage,
        "service":"facebook", //Has to be the same as exports.name
        "api":Facebook,
        "raw":message,
        "name":message.senderName,
        "username":message.senderID
    }
    return info    
}

function sendMessage(message, id) {
    Facebook.sendMessage(message, id);
    log.info("Sent message '" + message + "' to " + id, "Facebook");
}

exports.send = sendMessage;

exports.chatbotInit = function(chatRecieve) {
    recieveHandler = chatRecieve;

    config = require("./facebook.json");

    if (!config.email || !config.password) {
        log.erro("Email or password not provided, module disabled", "Facebook");
        return;    
    }

    login(config, function(err, api) {
        if (err) return log.error("Error logging in", "Facebook");

        Facebook = api;

        log.info("Logged in as " + api.getCurrentUserID(), "Facebook");

        api.setOptions({"listenEvents":true, "updatePresence":true, "forceLogin":true});

        stopListening = api.listen(function(err, message) {
            if (err) return log.error("Error in listen event", "Facebook");

            switch(message.type) {
                case "message":
                    recieveHandler(message.body, "text", getInfoTemplate(message), message.threadID);
                    break;
                case "presence":
                    
                    break;
                case "event":
                    switch(message.logMessageType) {
                        case "log:thread-name":
                            var info = getInfoTemplate(message);
                            info.name = message.logMessageBody.split(" named")[0]; //Only provides the first name
                            info.username = message.author;

                            recieveHandler(message.logMessageData.name, "facebook_groupNameChange", info, message.threadID);
                            break;
                        case "log:subscribe":
                            for (i=0;i<message.logMessageData.added_participants.length;i++) {
                                var info = getInfoTemplate(message);
                                info.name = message.logMessageBody.split(" added")[0];
                                info.username = message.author;

                                recieveHandler(message.logMessageData.added_participants[i].split(":")[1], "facebook_addedParticipant", info, message.threadID);
                            }
                            break;
                        case "log:unsubscribe":
                            for (i=0;i<message.logMessageData.removed_participants.length;i++) {
                                var info = getInfoTemplate(message);
                                info.name = message.logMessageBody.split(" removed")[0];
                                info.username = message.author;
    
                                recieveHandler(message.logMessageData.removed_participants[0].split(":")[1], "facebook_removedParticipant", info, message.threadID);
                            }
                            break;
                    }
                    break;
                case "typ":
                    recieveHandler(message.isTyping, "facebook_isTyping", getInfoTemplate(message), message.threadID);
                    break;
            }
        });
    });
}