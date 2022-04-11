const {resolvePayload} = require('node-red-contrib-rollun-backend-utils')
const EbayAPI = require('./ebay-sdk');

module.exports = function (RED) {

  function EbayAPINode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.config = RED.nodes.getNode(config.config);

    node.on('input', function (msg) {
      const ebayAPI = new EbayAPI(node.config)

      const apiName = config.apiName;

      if (!ebayAPI[apiName]) {
        msg.payload = {error: `Unknown ebay API [${apiName}]`};
        return node.send([msg, null]);
      }

      const methodName = config.methodName;

      if (!ebayAPI[apiName][methodName]) {
        msg.payload = {error: `Unknown method [${methodName}] in [${apiName}] API`};
        return node.send([msg, null]);
      }

      ebayAPI[apiName][methodName](resolvePayload(msg, config.requestPayload))
        .then(({data, config: {url}}) => {
          msg.payload = data;
          msg.url = url;
          node.send([null, msg]);
        })
        .catch((err) => {
          if (!err.response) {
            msg.payload = {error: err.message || err.errno};
          } else {
            msg.payload = err.response.data;
            msg.status = err.response.status;
            msg.headers = err.response.headers;
          }
          node.send([null, msg]);
        })
    });
  }

  RED.nodes.registerType("ebay-api", EbayAPINode);
}
