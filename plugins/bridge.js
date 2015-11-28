//Bridge by Angus Trau
//Creates 1-way bridges between 2 chat rooms

var fs = require("fs");
var log = require("../logging.js");

var bridges = require("./bridge/bridges.json"); //loads current bridges
var openHosts = {}; //Current rooms in register mode

var isSaving = false
function save() {
    if (isSaving) return;

    isSaving = true;
    fs.writeFile("plugins/bridge/bridges.json", JSON.stringify(bridges), function() {isSaving = false});
}

function newChat(info, id) {
    var chat = {};
    chat.send = info.handler;
    chat.id = info.service + "_" + id;
    chat.handler_id = id;
    chat.info = info;

    return chat;
}

function stopRegistration(id) {
    if (openHosts[id]) {
        var chat = openHosts[id];
        chat.send("Bridge registration timeout. Use '!bridge register' to start again.", chat.handler_id);
        openHosts[id] = undefined;
    }
}

var providers = {};

exports.chatbotProviders = function(chatProviders) {
    providers = chatProviders;

    Object.keys(providers).forEach(function(key) {
        if (!bridges[key]) bridges[key] = {};
        log.info("Found provider '" + key + "'", "Bridge");
    });
    save();
}

exports.chatbotEvent = function(message, type, info, id) {
    if (type != "text") return;

    if (message.slice(0, 7).toLowerCase() == "!bridge") {
        //command
        var args = message.slice(8).split(" ");
        var command = args[0].toLowerCase();
        args.shift();

        switch(command) {
            case "register":
                //Generate random id
                var registerID = "";
                var possible = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789"; //Similar looking characters have been removed
                for( var i=0; i < 5; i++ ) {
                    registerID = registerID + possible.charAt(Math.floor(Math.random() * possible.length));
                }

                var chat = newChat(info, id);
                openHosts[registerID] = chat;

                //add 5 minute registration timeout
                setTimeout(function() {
                    stopRegistration(registerID);
                }, 300000);

                info.handler("Chat open for bridging. Type '!bridge join " + registerID + "' in another chat within 5 minutes to complete bridge", id);
                break;
            case "join":
                if (args[0] == "") {
                    info.handler("No ID provided. Type '!bridge help' for more info", id);
                    return;
                }

                if (openHosts[args[0]]) {
                    var chat = openHosts[args[0]];
                    var target = newChat(info, id);

                    if (!bridges[chat.info.service][chat.id]) bridges[chat.info.service][chat.id] = {};
                    bridges[chat.info.service][chat.id][target.info.service] = target.handler_id;
                    save();

                    openHosts[args[0]] = undefined;

                    chat.send("Bridge success. " + chat.id + " --> " + target.id, chat.handler_id);
                    target.send("Bridge success. " + chat.id + " --> " + target.id, target.handler_id);

                    log.info("Bridged created. " + chat.id + " --> " + target.id, "Bridge");
                } else {
                    info.handler("Could not bridge with the chat with ID '" + args[0] + "'. The chat is either not open for bridging, the ID been misspelled, the ID has already been used, or the ID has expired.", id);
                    return;
                }

                break;
            case "destroy":
                var chat = newChat(info, id);

                var connectedChats = Object.keys(bridges[chat.info.service][chat.id]);
                connectedChats.forEach(function(key) {
                   var value = bridges[chat.info.service][chat.id][key];
                   providers[key].send("Bridge with " + chat.id + " has been destroyed", value);
                });

                bridges[chat.info.service][chat.id] = undefined;
                save();
                break;
            case "help":
            default:
                info.handler("Bridge:\nregister <password>: Initiate a bridge.\njoin <ID>: Finalise a bridge that has registered with ID. ID is one use only.\ndestroy: Destroy all outgoing bridges.\nhelp: Display help.", id);
                break;
        }
    } else {
        //message
        var chat = newChat(info, id);

        if (!bridges[chat.info.service][chat.id]) return;

        var connectedChats = Object.keys(bridges[chat.info.service][chat.id]);
        connectedChats.forEach(function(key) {
            var value = bridges[chat.info.service][chat.id][key];
            providers[key].send("[" + info.name + "] " + message, value);
        });
    }
}