module.exports = function (RED) {
  function EbayConfig(n) {
    RED.nodes.createNode(this, n);

    this.dealerNumber = n.dealerNumber.trim();
    this.login = n.login.trim();
    this.password = n.password.trim();
  }

  RED.nodes.registerType("parts-unlimited-config", EbayConfig);
}
