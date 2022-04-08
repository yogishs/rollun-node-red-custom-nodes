const {getTypedFieldValue} = require('node-red-contrib-rollun-backend-utils')

module.exports = function (RED) {
  function DeleteDocument(config) {
    RED.nodes.createNode(this, config);
    this.config = RED.nodes.getNode(config.config);
    const node = this;

    node.on('input', function (msg) {

      const makeError = (node, text) => {
        msg.error = {error: text};
        msg.payload = undefined;
        node.send(msg)
      };


      if (!node.config) return makeError(node, `node.config is required!`);
      if (!config.docId) return makeError(node, `config.docId is required!`);

      const client = new global.delovod.DelovodAPIClient(node.config);

      const docId = getTypedFieldValue(msg, config.docId);

      client
        .setDelMark(docId, config.forceDelete || false)
        .then(res => {
          msg.payload = res;
          node.send([null, msg]);
        })
        .catch(err => {
          msg.payload = {error: err.message};
          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType("delovod-del-doc", DeleteDocument);
}
