module.exports = function (RED) {
  function GSheetConfig(n) {
    RED.nodes.createNode(this, n);

    this.creds = JSON.parse(n.creds);
  }

  RED.nodes.registerType("gsheets-config", GSheetConfig);
}
