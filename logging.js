var colors = require("colors");
var strftime = require("strftime");


exports.info = function(message, service) {
    var time = "[" + strftime("%d/%m/%y %k:%M:%S") + "]";

    var service = "[" + service + "]";
    if (service == "[ChatBot]") {
        service = service.magenta;
    } else {
        service = service.yellow;
    }

    console.log(time.cyan.bold + service.bold + " " + message);
}

exports.error = function(message, service) {
    exports.info(message.red, service);
}