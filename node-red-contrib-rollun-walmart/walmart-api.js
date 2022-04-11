const {resolvePayload} = require('node-red-contrib-rollun-backend-utils')
const WalmartAPIClient = require('./walmart-api-client');
const _ = require('lodash');

module.exports = function (RED) {
  function WalmartAPI(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);


    // TODO move this logic to common module for ebay and walmart
    node.on('input', function (msg) {
      const makeError = text => {
        msg.payload = {error: text};
        node.send([msg, null]);
      };

      if (!node.config) return makeError(`walmart config is required!`);

      const client = new WalmartAPIClient({
        ...node.config,
        correlationId: msg._msgid
      });

      if (!client[config.apiName]) return makeError(`invalid API name: ${config.apiName}`);
      if (!client[config.apiName][config.methodName]) return makeError(`invalid method name ${config.methodName} in API ${config.apiName} `);

      client[config.apiName][config.methodName](resolvePayload(msg, config.requestPayload))
        .then(result => {
          msg.payload = result;
          node.send([null, msg]);
        })
        .catch(err => {
          msg.payload = {err: err.message};
          msg.response = {
            status: err.response && err.response.status ? err.response.status : undefined,
            data: err.response && err.response.data ? err.response.data : undefined
          }
          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType("walmart-api", WalmartAPI);
}
