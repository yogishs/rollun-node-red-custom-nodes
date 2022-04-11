const MwsApi = require('amazon-mws');

module.exports = function (RED) {
  function mwsConfigNode(config) {
    RED.nodes.createNode(this, config)
    this.accessKeyId = config.accessKeyId
    this.secretAccessKey = config.secretAccessKey
    this.merchantId = config.merchantId
    this.MWSAuthToken = config.MWSAuthToken;
    this.marketplaceId = config.marketplaceId;
    this.host = config.host || "mws.amazonservices.com"

    this.client = new MwsApi();
    this.client.setApiKey(this.accessKeyId, this.secretAccessKey);

  }

  RED.nodes.registerType('mws-config', mwsConfigNode)
}
