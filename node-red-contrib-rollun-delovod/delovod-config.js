module.exports = function(RED) {
  function DelovodConfig(n) {
    RED.nodes.createNode(this,n);
    this.version = n.version;
    this.key = n.key;
    this.name = n.name;
    this.host = n.host;
  }
  RED.nodes.registerType("delovod-config", DelovodConfig);
}
