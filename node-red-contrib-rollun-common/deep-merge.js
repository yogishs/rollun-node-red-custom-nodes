const {getTypedFieldValue} = require('../node-red-contrib-common-utils/1-global-utils')

module.exports = function (RED) {
  const _ = require('lodash');

  function DeepMerge(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', function (msg) {
      const first = getTypedFieldValue(msg, config.first);
      const second = getTypedFieldValue(msg, config.second);

      console.log(config.result);
      const [, resultField] = (config.result || 'msg|result').split('|');
      console.log(resultField);

      _.set(msg, resultField, _.merge(first, second));
      node.send(msg);
    });
  }

  RED.nodes.registerType("deep-merge", DeepMerge);
};
