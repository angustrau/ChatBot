// Generated by CoffeeScript 1.10.0
(function() {
  var ChatReq, NetworkError, Q, log, ref, req, request, tryparse;

  log = require('bog');

  request = require('request');

  Q = require('q');

  ref = require('./util'), req = ref.req, NetworkError = ref.NetworkError, tryparse = ref.tryparse;

  module.exports = ChatReq = (function() {
    function ChatReq(jarstore, init, channel, proxy) {
      this.jarstore = jarstore;
      this.init = init;
      this.channel = channel;
      this.proxy = proxy;
    }

    ChatReq.prototype.baseReq = function(url, contenttype, body, json, timeout) {
      var headers, opts, params;
      if (json == null) {
        json = true;
      }
      if (timeout == null) {
        timeout = 30000;
      }
      headers = this.channel.authHeaders();
      if (!headers) {
        return Q.reject(new Error("No auth headers"));
      }
      headers['Content-Type'] = contenttype;
      params = {
        key: this.init.apikey,
        alt: json ? 'json' : 'protojson'
      };
      opts = {
        method: 'POST',
        uri: url,
        jar: request.jar(this.jarstore),
        proxy: this.proxy,
        qs: params,
        headers: headers,
        body: Buffer.isBuffer(body) ? body : JSON.stringify(body),
        encoding: null,
        timeout: timeout
      };
      return req(opts).fail(function(err) {
        log.debug('request failed', err);
        return Q.reject(err);
      }).then(function(res) {
        var ref1, ref2, showBody;
        showBody = res.statusCode === 200 ? '' : (ref1 = res.body) != null ? typeof ref1.toString === "function" ? ref1.toString() : void 0 : void 0;
        log.debug('request for', url, 'result:', res.statusCode, showBody);
        if (res.statusCode === 200) {
          if (json) {
            return tryparse(res.body.toString());
          } else {
            return res.body;
          }
        } else {
          log.debug('request for 2', url, 'result:', res.statusCode, (ref2 = res.body) != null ? typeof ref2.toString === "function" ? ref2.toString() : void 0 : void 0);
          return Q.reject(NetworkError.forRes(res));
        }
      });
    };

    ChatReq.prototype.req = function(endpoint, body, json) {
      var url;
      if (json == null) {
        json = true;
      }
      url = "https://clients6.google.com/chat/v1/" + endpoint;
      return this.baseReq(url, 'application/json+protobuf', body, json);
    };

    return ChatReq;

  })();

}).call(this);

//# sourceMappingURL=chatreq.js.map