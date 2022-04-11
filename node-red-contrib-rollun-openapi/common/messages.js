"use strict";
const _ = require('lodash');
const { parseTypedInput, resolvePayload } = require('node-red-contrib-rollun-backend-utils');

module.exports = function register(RED) {
  RED.nodes.registerType('rollun-openapi-messages', function openapiOutNode(props) {
    const _this = this;
    RED.nodes.createNode(this, props);

    this.on('input', function (msg) {
      const { oldMessages = [], text, type, fromMsg } = resolvePayload(msg, {
        oldMessages: props.oldMessages,
        text: props.text,
        type: props.msgType,
        fromMsg: props.fromMsg,
      });

      const message = {
        level: fromMsg || props.level,
        text,
        type,
      };
      const messages = [...oldMessages, message];
      const [, val] = parseTypedInput(props.oldMessages);

      if (val) {
        _.set(msg, val, messages);
      } else {
        msg.messages = messages;
      }

      _this.send(msg)
    });
  });
};
