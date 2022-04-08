const {getTypedFieldValue} = require('node-red-contrib-rollun-backend-utils');

module.exports = function (RED) {
  function DelovodQuery(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);


    node.on('input', function (msg) {

      const good = getTypedFieldValue(msg, config.good);
      const price = +getTypedFieldValue(msg, config.price);
      const qty = +getTypedFieldValue(msg, config.qty);
      const accGood = getTypedFieldValue(msg, config.accGood);
      const goodType = getTypedFieldValue(msg, config.goodType);
      const unit = getTypedFieldValue(msg, config.unit);
      const analytics1 = getTypedFieldValue(msg, config.unit);
      const analytics2 = getTypedFieldValue(msg, config.unit);
      const analytics3 = getTypedFieldValue(msg, config.unit);
      msg.payload = {
        good,
        // DEPRECATED goodType
        ...(goodType && {goodType}),
        ...(accGood && {accGood}),
        price: price,
        amountCur: price * qty,
        qty: qty,
        // baseQty: +item.quantity,
        unit, // шт
        ...(analytics1 && {analytics1}),
        ...(analytics2 && {analytics2}),
        ...(analytics3 && {analytics3}),
      };
      node.send(msg);
    });
  }

  RED.nodes.registerType("delovod-tablepart-tpGoods", DelovodQuery);
}
