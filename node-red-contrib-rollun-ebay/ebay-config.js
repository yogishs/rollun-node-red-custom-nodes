module.exports = function (RED) {
  function EbayConfig(n) {
    RED.nodes.createNode(this, n);


    this.refreshToken = n.refreshToken.trim();
    this.clientId = n.clientId.trim();
    this.clientSecret = n.clientSecret.trim();
    this.scopes = n.scopes ? n.scopes.split(/\s+/) : undefined;
  }

  RED.nodes.registerType("ebay-config", EbayConfig);
}
