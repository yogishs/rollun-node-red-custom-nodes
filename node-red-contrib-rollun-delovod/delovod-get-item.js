const {resolvePath} = require('node-red-contrib-rollun-backend-utils');

module.exports = function (RED) {
  function Filter(config) {
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
      if (!config.docType) return makeError(node, `config.docType is required!`);

      const conditions = JSON.parse(config.conditions).map(cond => {
        let value = cond.value;
        if (value.indexOf('msg') === 0) {
          value = resolvePath(msg, value.replace(/^msg\./, ''));
        }
        return {...cond, value};
      });

      const client = new global.delovod.DelovodAPIClient(node.config);

      const fields = conditions.reduce((acc, cond) => {
        acc[cond.alias] = cond.alias;
        return acc
      }, {});

      if (!('id' in fields)) {
        fields.id = 'id'
      }

      const {getObject, request} = client.actions;
      const actionType = conditions.length === 1 && conditions[0].alias === 'id'
        ? getObject
        : request;

      const errorField = config['errorField'] || 'error';
      const returnFirstIfMoreThanOne = config.returnFirstIfMoreThanOne || false;
      const getFullObject = config.getFullObject || false;
      (async () => {
        let result = actionType === request
          ? await client.request(config.docType, conditions)
          : await client.getObject(conditions[0].value);

        if (!Array.isArray(result)) {
          msg.payload = result;
          return node.send([null, msg]);
        }

        if (result.length === 0) {
          msg.payload = {[errorField]: 'Not found any documents by filter!'};
          return node.send([msg, null]);
        }

        if (returnFirstIfMoreThanOne === true && result.length > 1) {
          result = [result[0]];
        }

        if (result.length > 1) {
          msg.payload = {[errorField]: `Found more than one document by filter: ${result.map(({id__pr}) => id__pr).join(', ')}`}
          return node.send([msg, null]);
        }

        let item = result[0];
        if (getFullObject === true) {
          item = await client.getObject(item.id);
        }

        msg.payload = item;
        node.send([null, msg]);
      })()
        .catch(err => {
          msg.payload = {[errorField]: err.message};
          node.send([msg, null]);
        })
    })
  }

  RED.nodes.registerType("delovod-get-item", Filter);
}
