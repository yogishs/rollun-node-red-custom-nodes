const _ = require('lodash');
const {getTypedFieldValue} = require('node-red-contrib-rollun-backend-utils')

module.exports = function (RED) {
  function MWSNode(config) {

    RED.nodes.createNode(this, config)
    const node = this;
    this.action = config.action
    this.config = RED.nodes.getNode(config.config)

    if (this.config === null) {
      return node.error('config is required');
    }
    const mws = this.config.client
    node.on('input', function (msg) {

      const category = _.camelCase(config.category);
      const api = mws[category];

      if (!api) {
        msg.payload = {error: `Unknown category: ${config.category} (${category})`}
        return node.send([msg, null]);
      }

      let payload = getTypedFieldValue(msg, config.actionPayload) || {};
      if (typeof payload !== "object") {
        msg.payload = {error: `Action payload must be an object`}
        return node.send([msg, null]);
      }

      payload = _.fromPairs(
        _.toPairs(payload)
          .map(([key, value]) => {
            // if value matches date pattern - 2020-01-22, convert it to Date object
            if (/^[0-9]{4}-[01][0-9]-[0123][0-9]$/.test(value)) {
              return [key, new Date(value)]
            }
            return [key, value];
          })
      );


      const version = getTypedFieldValue(msg, config.version);


      if (!api[config.actionType]) {
        msg.payload = {
          error: `Can't find requester with Action type '${config.actionType}' on Category '${category}' and action '${config.action}', try another type instead.`
        }
        return node.send([msg, null]);
      }

      api[config.actionType]({
        'Version': version,
        'Action': config.action,
        'SellerId': node.config.merchantId,
        'MWSAuthToken': node.config.MWSAuthToken,
        ...payload
      }).then(res => {
        msg.payload = res;
        node.send([null, msg]);
      })
        .catch(err => {
          msg.payload = {
            error: Object.entries(err).reduce((acc, [key, val]) => {
              acc[key] = val;
              return acc;
            }, {})
          };
          node.send([msg, null]);
        })
    });
  }

  RED.nodes.registerType('MWS', MWSNode)
}
