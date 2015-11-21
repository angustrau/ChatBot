var HangupsLib = require("./hangouts/src/client.js");
var Hangups = new HangupsLib();
var Q = require("./hangouts/node_modules/q");

var recievehandler;
var config = {};
var self_user;
var self_id = "";
var userCache = {};

function getAuthToken() {
    return Q().then(function() {
        return Q.Promise(function(rs) {
            rs(config.authtoken);
        });
    });    
}

function getInfoTemplate(message) {
    Hangups.getentitybyid([message.sender_id.chat_id]).then(function(users) {
        //initiate request for user info. it may not be avaliable in time now, but will be cached for the next message
        userCache[users.entities[0].id.chat_id] = users.entities[0].properties;
    });

    var name = "";
    if (userCache[message.sender_id.chat_id]) {
        name = userCache[message.sender_id.chat_id].display_name;
    }

    var info = {
        "handler":sendMessage,
        "service":"hangouts",
        "api":Hangups,
        "raw":message,
        "name":name,
        "username":message.sender_id.chat_id
    }
    return info    
}

function sendMessage(message, id) {
    var builder = new HangupsLib.MessageBuilder();
    var segments = builder.text(message).linebreak().toSegments();
    Hangups.sendchatmessage(id, segments);
    console.log("[Hangouts] Sent message '" + message + "' to " + id);
}

Hangups.on("chat_message", function(message) {
    if (message.sender_id.chat_id == self_id) return;

    var messageText = "";

    message.chat_message.message_content.segment.forEach(function(segment) {
         messageText = messageText + segment.text;
    });

    recieveHandler(messageText, "text", getInfoTemplate(message), message.conversation_id.id);
});

Hangups.on("connect_failed", function() {
    //Reconnect the client if disconnected
    Q.Promise(function(rs) {
        setTimeout(rs, 3000);
    }).then(exports.chatbotInit(recieveHandler));
});

exports.chatbotInit = function(chatRecieve) {
    recieveHandler = chatRecieve;

    config = require("./hangouts.json");

    if (!config.authtoken) {
        console.log("[Hangouts] Auth token not provided, get one here: https://accounts.google.com/o/oauth2/auth?&client_id=936475272427.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.google.com%2Faccounts%2FOAuthLogin&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code");
        return;
    }
    
    Hangups.connect(function() {return {"auth":getAuthToken}})
        .then(function() {
            Hangups.getselfinfo().then(function(user) {
                self_user = user;
                self_id = user.self_entity.id.chat_id;
                console.log("[Hangouts] Connected as " + user.self_entity.properties.display_name);
            });
        })
        .done();
}