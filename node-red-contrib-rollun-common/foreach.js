const {ForEachState} = require("./array-map-state");
const {getTypedFieldValue} = require('node-red-contrib-rollun-backend-utils');
const _ = require('lodash');

module.exports = function (RED) {

  let forEachStatesMap = {};

  const getForEachState = (startNodeId, msgid) => {
    return forEachStatesMap[`${startNodeId}_${msgid}`];
  };

  const createForEachState = (startNodeId, msgid) => {
    return forEachStatesMap[`${startNodeId}_${msgid}`] = new ForEachState();
  };

  const deleteForEachState = (startNodeId, msgid) => {
    delete forEachStatesMap[`${startNodeId}_${msgid}`];
  };

  function getMetaInfoKey(n) {
    if (!n) return 'unknown_foreach_node';
    return (n.name || n.id).replace(/\s/g, '').toLowerCase();
  }

  function ForEachStart(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const event = "node:" + n.link;
    const backChannelEvent = 'back_channel_' + event;
    const metaInfoKey = getMetaInfoKey(n);

    // add delay to let foreach-end mount
    setTimeout(() => {
      const endNode = RED.nodes.getNode(n.link);
      endNode && (endNode.link = n.id);
    }, 50);

    const handler = function (msg) {
      const state = getForEachState(n.id, msg._msgid);
      const resolve = state && state.getResolveFn(msg, metaInfoKey);
      resolve && resolve(msg);
    };

    RED.events.on(backChannelEvent, handler);

    this.on("input", async function (msg) {
      const state = createForEachState(n.id, msg._msgid);

      if (state.isIterationInProgress(msg, metaInfoKey)) {
        msg.payload = {error: 'iteration_is_already_in_progress'};
        deleteForEachState(n.id, msg._msgid);
        return node.send(msg);
      }

      let iterable = getTypedFieldValue(msg, n.inputField);
      if (!iterable) {
        msg.payload = {error: 'no_input_iterable'};
        return node.send(msg);
      }

      const type = Array.isArray(iterable) ? 'array' : (typeof iterable === 'object' ? 'object' : '');

      msg[metaInfoKey] = {
        size: iterable.length,
        type: type
      };

      if (!type) {
        msg.payload = {error: 'invalid_iterable_type'};
        deleteForEachState(n.id, msg._msgid);
        return node.send(msg);
      }

      iterable = type === 'array' ? arrayToPairs(iterable) : Object.entries(iterable);
      state.initResult(msg, metaInfoKey);

      if (iterable.length === 0) {
        msg.__stopReason = 'empty_iterable';
        return RED.events.emit(event, msg);
      }

      try {
        const [, path] = n.outputField.split('|');
        let resultMsg = msg;
        for (const [key, value] of iterable) {
          // indexes are strings after Object.entries function applied to array
          resultMsg[metaInfoKey].key = type === 'array' ? +key : key;
          _.set(resultMsg, path, value);

          resultMsg = await new Promise((resolve, reject) => {
            state.addResolveFn(resultMsg, metaInfoKey, resolve);
            state.addBreakFn(resultMsg, metaInfoKey, reject);
            node.send([null, resultMsg]);
          });
        }
        resultMsg.__stopReason = 'iteration_end';
        RED.events.emit(event, resultMsg);
      } catch (e) {
        console.log('err', e);
      }

    });

    this.on("close", function () {
      // reset states on close
      forEachStatesMap = {};
      RED.events.removeListener(backChannelEvent, handler);
    });
  }

  RED.nodes.registerType("foreach-start", ForEachStart);

  function cleanUpMsg(msg, startNodeId, metaInfoKey) {
    delete msg[metaInfoKey];
    delete msg.__errorReason;
    delete msg.__stopReason;
    deleteForEachState(startNodeId, msg._msgid);
  }

  function ForEachEnd(n) {
    RED.nodes.createNode(this, n);
    const event = "node:" + n.id;
    const backChannelEvent = 'back_channel_' + event;
    const node = this;

    const handler = function (msg) {
      const self = RED.nodes.getNode(n.id);
      const startNode = RED.nodes.getNode(self.link);
      const state = getForEachState(self.link, msg._msgid);
      const metaInfoKey = getMetaInfoKey(startNode);
      if (msg.__stopReason === 'break') {
        cleanUpMsg(msg, self.link, metaInfoKey);
        return node.send(msg);
      }

      const [, path] = n.outputField.split('|');
      if ('empty_iterable' === msg.__stopReason) {
        if (state) {
          _.set(msg, path, state.getResult(msg, metaInfoKey, n.filterEmpty));
        }
        cleanUpMsg(msg, self.link, metaInfoKey);
        return node.send([null, msg]);
      }
      if ('iteration_end' === msg.__stopReason) {
        if (state) {
          _.set(msg, path, state.getResult(msg, metaInfoKey, n.filterEmpty));
        }
        cleanUpMsg(msg, self.link, metaInfoKey);
        return node.send([null, msg]);
      }
      return node.send(msg);
    };

    RED.events.on(event, handler);

    this.on("input", function (msg) {
      // add little delay, to resolve issue, when message comes to foreach-end faster than
      // foreach-break, when no other delays exists, foreach-end may trigger another message from
      // foreach-start after break happened
      setTimeout(() => {
        const self = RED.nodes.getNode(n.id);
        const startNode = RED.nodes.getNode(self.link);
        const state = getForEachState(self.link, msg._msgid);
        if (state) {
          state.addToResult(msg, getMetaInfoKey(startNode), n.inputField);
        }
        RED.events.emit(backChannelEvent, msg);
      }, 100);
    });
    this.on("close", function () {
      RED.events.removeListener(event, handler);
    });
  }

  RED.nodes.registerType("foreach-end", ForEachEnd);

  function ForEachBreak(n) {
    RED.nodes.createNode(this, n);
    this.on("input", function (msg) {
      const endNode = RED.nodes.getNode(n.link);
      const startNode = endNode && RED.nodes.getNode(endNode.link);
      const metaInfoKey = getMetaInfoKey(startNode);
      const state = startNode && getForEachState(startNode.link, msg._msgid);
      const reject = state && state.getBreakFn(msg, metaInfoKey);
      reject && reject();
      state && state.clearBreakFn(msg, metaInfoKey);
      msg.__stopReason = 'break';
      RED.events.emit("node:" + n.link, msg);
    });
  }

  RED.nodes.registerType("foreach-break", ForEachBreak);
};

/**
 * Safe function, that ignores additional properties on array objects.
 * Examples:
 *  const arr = [1, 2, 3];
 *  arr.test = '42';
 *  Object.entries(arr)
 *  // [
 *   [ '0', 1 ],
 *   [ '1', 2 ],
 *   [ '2', 3 ],
 *   [ '3', 4 ],
 *   [ 'test', 'hidden' ]
 *    ]
 *  additional prop treated as key, and added as key.
 *
 * This function avoids this
 *
 * arrayToPairs(arr)
 * // [ [ '0', 1 ], [ '1', 2 ], [ '2', 3 ], [ '3', 4 ] ]
 *
 * @param array
 * @return {*}
 */

function arrayToPairs(array) {
  return array.map((value, idx) => [`${idx}`, value]);
}
