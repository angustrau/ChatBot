exports.chatbotEvent = function(message, type, info, id) {
    if (type != "text") return;
    
    switch(message.split(" ")[0].toLowerCase()) {
        case "hi":
        case "hello":
        case "greetings":
            info.handler("Hello " + info.name.split(" ")[0] + "!", id);
            return
    }
}