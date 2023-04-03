'use strict';
const helpers = require('./helpers');
const route = require('./route');

module.exports = function register(RED) {
  RED.nodes.registerType('openapi-in', function openapiNode(props) {
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
      this.error('Schema not found: ' + this.schema);
      return;
    }
    var router = helpers.findRouter(RED, this.schema);
    if (!router) {
      this.error('Schema not found: ' + this.schema);
      return;
    }
    route.openApiRoute({
      schema: schema,
      router,
      operation: _this.operation,
      node: _this,
      RED,
    });
    this.routeInstalled = true;
    RED.events.emit(`${this.schema}:route-installed`, this);
  });
};
