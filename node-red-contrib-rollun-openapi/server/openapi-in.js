"use strict";
const helpers = require("./helpers");
const queue = require("./queue");
const route = require("./route");
const { defaultLogger } = require('node-red-contrib-rollun-backend-utils');

module.exports = function register(RED) {
  RED.nodes.registerType('rollun-openapi-in', function openapiNode(props) {
    var _this = this;
    RED.nodes.createNode(this, props);
    if (!props.schema) {
      this.error('Schema not set');
      return;
    }
    if (!props.operation) {
      this.error('Operation not set');
      return;
    }
    this.schema = props.schema;
    this.operation = props.operation;
    var schema = helpers.findSchema(RED, this.schema);
    if (!schema) {
      this.error("Schema not found: " + this.schema);
      return;
    }
    var lazyRouter = helpers.findRouter(RED, this.schema);
    if (!lazyRouter) {
      this.error("Schema not found: " + this.schema);
      return;
    }
    lazyRouter(function (r) {
      _this.on('close', route.openApiRoute({
        schema: schema,
        router: r,
        operation: _this.operation,
        handler: function (req, res, next) {
          const msgid = RED.util.generateId();
          const { lToken, plToken } = queue.enqueue(msgid, req, res, next);
          req.plToken = plToken;
          req.lToken = lToken;
          defaultLogger.withMsg({ req })(
            'info',
            `OpenAPIServerReq: ${req.method} ${req.path}`,
            { body: req.body, query: req.query, params: req.params, headers: req.headers },
          );
          const msg = {
            _msgid: msgid,
            openapiRequest: {
              lToken,
              plToken,
              remoteAddress: req.socket.remoteAddress,
              cookies: req.cookies,
              headers: req.headers,
              params: req.params,
              path: req.path,
              url: req.url,
              payload: req.body,
              query: req.query,
            },
          };
          _this.send(msg);
        },
      }));
    });
  });
};
