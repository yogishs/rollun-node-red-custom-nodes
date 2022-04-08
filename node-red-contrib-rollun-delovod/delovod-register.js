const {getTypedFieldValue} = require('node-red-contrib-rollun-backend-utils')

module.exports = function (RED) {
  function RegisterQuery(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);

    node.on('input', function (msg) {
      const makeError = (node, text) => {
        msg.error = {error: text};
        msg.payload = undefined;
        node.send(msg)
      };

      let conditions
      try {
        conditions = JSON.parse(config.conditions)
        conditions = conditions.map(cond => {
          return {
            ...cond,
            value: cond.value.trim().indexOf('msg.') === 0
              ? getTypedFieldValue(msg, 'msg|' + cond.value.replace(/^msg\./, ''))
              : cond.value.trim()
          }
        })
      } catch (e) {
        return makeError(`Config parsing error, report it pls) ${e.message}`);
      }

      const [type, register] = config.register.split('Registers.');

      new global.delovod.DelovodAPIClient(node.config)
        .requestRegister({
          type,
          register,
          filters: conditions.filter(({value}) => !!value),
          fields: conditions.filter(({value}) => !value).map(({alias}) => alias),
          date: getTypedFieldValue(msg, config.date)
        })
        .then(res => {
          msg.payload = res || null;
          node.send([null, msg]);
        })
        .catch(err => {
          msg.payload = {err: err.message}
          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType("delovod-register", RegisterQuery);
}
