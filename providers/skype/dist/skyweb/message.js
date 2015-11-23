/// <reference path='../typings/tsd.d.ts' />
var request = require('request');
var Consts = require('./consts');
var Utils = require('./utils');
var log = require("../../../../logging.js");
'use strict';
var MessageService = (function () {
    function MessageService(cookieJar) {
        this.requestWithJar = request.defaults({ jar: cookieJar });
    }
    MessageService.prototype.sendMessage = function (skypeAccount, conversationId, message) {
        var requestBody = JSON.stringify({
            'content': message,
            'messagetype': 'RichText',
            'contenttype': 'text'
        });
        log.info('sending message ' + requestBody, "Skype");
        this.requestWithJar.post(Consts.SKYPEWEB_HTTPS + skypeAccount.messagesHost + '/v1/users/ME/conversations/' + conversationId + '/messages', {
            body: requestBody,
            headers: {
                'RegistrationToken': skypeAccount.registrationTokenParams.raw
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 201) {
            }
            else {
                Utils.throwError('Failed to send message.');
            }
        });
    };
    return MessageService;
})();
module.exports = MessageService;
//# sourceMappingURL=message.js.map