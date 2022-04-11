module.exports = function (RED) {
  function WalmartAPI(n) {
    RED.nodes.createNode(this, n);

    this.clientId = n.clientId;
    this.clientSecret = n.clientSecret;
  }

  RED.nodes.registerType("walmart-config", WalmartAPI);
}
