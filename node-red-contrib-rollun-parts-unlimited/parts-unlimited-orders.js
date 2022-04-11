const {resolvePayload} = require('node-red-contrib-rollun-backend-utils')
const {PartsUnlimitedAPI} = require('./pu-api');

module.exports = function (RED) {

  function PuApi(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.config = RED.nodes.getNode(config.config);

    node.on('input', async function (msg) {

      try {
        const api = new PartsUnlimitedAPI(node.config);

        if (!api[config.methodName]) {
          msg.payload = {error: `Unknown method [${config.methodName}] Orders API`};
          return node.send([msg, null]);
        }

        const payload = resolvePayload(msg, config.requestPayload);
        console.log('payload', payload);
        msg.payload = await api[config.methodName](payload);
        return node.send([null, msg]);
      } catch (err) {
        if (!err.response) {
          msg.payload = {error: err.message || err.errno};
        } else {
          msg.payload = err.response.data;
          msg.status = err.response.status;
          msg.headers = err.response.headers;
        }
        return node.send(msg);
      }
    });
  }

  RED.nodes.registerType("parts-unlimited-orders", PuApi);
}
