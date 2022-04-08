module.exports = function (RED) {
  function Filter(config) {
    RED.nodes.createNode(this, config);
    this.config = RED.nodes.getNode(config.config);
    const node = this;

    node.on('input', function (msg) {
      const axios = require('axios');

      const makeError = (node, text) => {
        msg.error = {error: text};
        msg.payload = undefined;
        node.send(msg)
      };

      function resolvePath(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
          var k = a[i];
          if (k in o) {
            o = o[k];
          } else {
            return;
          }
        }
        return o;
      }



      if (!node.config) return makeError(node, `node.config is required!`);
      if (!config.entityType) return makeError(node, `config.entityType is required!`);

      const conditions = JSON.parse(config.conditions).map(cond => {
        let value = cond.value;
        if (value.indexOf('msg') === 0) {
          value = resolvePath(msg, value.replace(/^msg\./, ''));
        }
        return {...cond, value};
      });

      const fields = conditions.reduce((acc, cond) => {
        acc[cond.alias] = cond.alias;
        return acc
      }, {});

      if (!('id' in fields)) {
        fields.id = 'id'
      }

      const url = node.config.host;
      const packet = `packet=${JSON.stringify({
        version: node.config.version,
        key: node.config.key,
        action: 'request',
        params: {
          from: config.entityType,
          fields: fields,
          filters: conditions
        }
      })}`;
      const errorField = config['errorField'] || 'error';

      msg.sentPacket = packet;
      axios
        .post(url, packet, {
          timeout: 10000,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(({data}) => {

          if (data.error) {
            msg.payload = {[errorField]: `[node: ${config.name}] ` + data.error}
            node.send([msg, null]);
          } else {
            msg.payload = data
            node.send([null, msg]);
          }
        })
        .catch(err => {

          msg.payload = {[errorField]: `[node: ${config.name}] `  + err.message}
          if (err.response) {
            // cannot serialise response with request property due to circular properties
            err.response.request = null;
          }
          msg.response = err.response;
          node.send([msg, null]);
        })
    })
  }

  RED.nodes.registerType("delovod-get-items", Filter);
}
