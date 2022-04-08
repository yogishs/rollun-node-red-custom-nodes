module.exports = function (RED) {
  function DelovodQuery(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);

    node.on('input', function (msg) {
      const makeError = (node, text) => {
        msg.payload = {error: text};
        node.send([msg, null])
      };

      if (!node.config) return makeError(node, `node.config is required!`);
      if (!config['action']) return makeError(node, `action is required!`);

      let debug = {};
      const client = new global.delovod.DelovodAPIClient({
        ...node.config,
        hooks: {
          onRequest: (data) => { debug.request = data },
          onResponse: (data) => { debug.response = data },
        }
      });

      client.baseRequest(config['action'], msg.payload)
        .then(res => {
          msg.payload = res || null;

          if (config.debug === true) {
            msg['delovod-api-request-v2'] = { debug }
          }

          node.send([null, msg]);
        })
        .catch(err => {
          console.log(err.stack);
          msg.payload = { error: err.message }

          if (config.debug === true) {
            msg['delovod-api-request-v2'] = { debug }
          }

          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType("delovod-api-request-v2", DelovodQuery);
}
