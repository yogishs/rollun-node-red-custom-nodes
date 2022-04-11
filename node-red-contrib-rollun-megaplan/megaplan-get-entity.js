const { MegaplanAPIV3Client } = require('./1-megaplan-utils');
const {resolvePath, parseTypedInput} = require('node-red-contrib-rollun-backend-utils')

module.exports = function (RED) {
  function MegaplanGetEntity(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);


    node.on('input', function (msg) {
      const makeError = text => {
        msg.payload = {error: text};
        node.send([msg, null]);
      };

      if (!config.entityId) return makeError(`Entity ID field is required`);
      if (!config.entity) return makeError(`Entity field is required`);

      const [type, entityIdValue] = parseTypedInput(config.entityId);

      const entityId = type === 'msg'
          ? resolvePath(msg, entityIdValue.replace('/^msg.', ''))
          : entityIdValue;

      if (!entityId) return makeError('Field Entity ID cannot be empty!');

      const client = new MegaplanAPIV3Client({host: node.config.host, email: node.config.email, password: node.config.password});

      client
          .getEntity(config.entity, entityId)
          .then(({data}) => {
            msg.payload = data;
            node.send([null, msg]);
          })
          .catch(err => {
            console.log(err);

            msg.payload = err.response ? err.response.data : err.message;
            node.send([msg, null])
          });

      // node.send([null, msg]);
    });
  }

  RED.nodes.registerType("megaplan-get-entity", MegaplanGetEntity);
}
