const { getTypedFieldValue, defaultLogger } = require('node-red-contrib-rollun-backend-utils')
const { HttpDatastore } = require('./http-datastore');

module.exports = function (RED) {
  function DatastoreCRUD(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', function (msg) {
      const makeError = (node, text) => {
        msg.payload = { error: text };
        node.send([msg, null])
      };

      if (!config.url) return makeError(node, `url is required!`);
      if (!config.action) return makeError(node, `action is required!`);
      if (!config.payload) return makeError(node, `payload is required!`);
      if (!config.idField) return makeError(node, `idField is required!`);

      const { url, action, idField, timeout, log } = config;

      const datastore = new HttpDatastore({
        URL: url,
        timeout: +timeout,
        idField,
        msg,
        logRequest: log
      });

      const payload = getTypedFieldValue(msg, config.payload);

      datastore[action]('', payload)
        .then(result => {
          msg.payload = result;
          if (result && result.error) {
            node.send([msg, null]);
          } else {
            node.send([null, msg]);
          }
        })
        .catch(err => {
          console.log(err);
          msg.payload = { error: err.message, request: err.request };
          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType("rollun-tables-crud", DatastoreCRUD);
}
