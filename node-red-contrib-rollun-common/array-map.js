const {ArrayMapState} = require("./array-map-state");
const {getTypedFieldValue} = require('../node-red-contrib-common-utils/1-global-utils');
const _ = require('lodash');

module.exports = function (RED) {
    let state = new ArrayMapState(RED);

    function ArrayMapStart({isSync = false} = {}) {
        return function (config) {
            RED.nodes.createNode(this, config);
            const node = this;
            this.config = RED.nodes.getNode(config.config);

            node.on('close', () => {
                console.log('Clean UP');
                // force garbage collection on state, to prevent memory leaks
                state = null;
                state = new ArrayMapState(RED)
            });

            node.on('input', function (msg) {

                const makeError = (node, text) => {
                    msg.payload = {error: text};
                    node.send([null, msg])
                };

                const interval = +config.interval;

                if (!config.arrayField) return makeError(node, `arrayField is required!`);
                if (isNaN(interval) || interval < 0) return makeError(node, `interval is required, and must be a number > 0!`);


                (async () => {
                    let iterable = getTypedFieldValue(msg, config.arrayField);

                    if (typeof iterable !== 'object') {
                        throw new Error('Data in arrayField must be either object or array!');
                    }

                    const type = Array.isArray(iterable) ? 'array' : 'object';

                    if (type === 'object') {
                        iterable = Object.entries(iterable);
                    }

                    if (iterable.length === 0) {
                        return node.send([null, null, msg]);
                    }

                    console.log('ARRAY: iterable length', {iterable: iterable.length});

                    const {req, res} = msg;

                    if (req) delete msg.req;
                    if (res) delete msg.res;

                    const msgid = RED.util.generateId();
                    let canIterate = true;
                    let i = 0;
                    let len = iterable.length;
                    while (canIterate) {
                        let key, value, index;
                        if (type === 'array') {
                            index = i;
                            value = iterable[i];
                        }

                        if (type === 'object') {
                            [key, value] = iterable[i];
                        }

                        const msgCopy = {
                            _msgid: msgid,
                            payload: value,
                            type,
                            ...(index !== undefined && {index: i}),
                            ...(key !== undefined && {key}),
                            totalItemsAmount: len,
                            topic: `Element #${i} of ${type}`,
                            originalMsg: msg,
                            req: req,
                            res: res
                        };

                        node.send(msgCopy);

                        if (isSync) {
                            // store 'resolve' func for promise, to call it from ArrayMapEnd, to 'resume' execution
                            // therefore creating 'sync' iteration effect
                            await (new Promise(resolve => {
                                arrayStartPromiseResolvers[msgCopy._msgid] = resolve;
                                state.addBreakFn(msgCopy, () => {
                                    canIterate = false;
                                    resolve();
                                })
                            }))
                        }

                        await (new Promise(resolve => setTimeout(() => resolve(), +config.interval)));
                        i++;
                        if (i >= len) {
                            canIterate = false;
                        }
                    }
                    console.log('ARRAY: ITERATION END');
                })()
                    .catch(err => {
                        console.log(err);
                        msg._isArrayMapError = true;
                        msg.error = err.message;
                        node.send(msg)
                    })
            });

        }
    }

    RED.nodes.registerType("array-map-start", ArrayMapStart());
    RED.nodes.registerType("array-map-start-sync", ArrayMapStart({isSync: true}));

    let arrayStartPromiseResolvers = {};

    function ArrayMapEnd({isSync = false} = {}) {
        return function (config) {
            RED.nodes.createNode(this, config);
            const node = this;
            this.config = RED.nodes.getNode(config.config);

            let timeouted = false;
            let timeout;
            const filterEmpty = !!config.filterEmpty;
            const [, resultField] = (config.resultField || 'msg|payload').split('|');

            const callArrayStartResolve = ({_msgid}) => {
                arrayStartPromiseResolvers[_msgid] && arrayStartPromiseResolvers[_msgid]();
            };

            const clearArrayStartResolve = ({_msgid}) => {
                if (arrayStartPromiseResolvers[_msgid]) {
                    delete arrayStartPromiseResolvers[_msgid]
                }
            };

            node.on('input', function (msg) {

                if (msg.__arrayMapBreakFlag) {
                    const finalMsg = {
                        ...(msg.originalMsg || {}),
                        [resultField]: msg.__breakPayload
                            ? msg.__breakPayload
                            : state.getResult(msg, filterEmpty),
                        req: msg.req,
                        res: msg.res
                    };
                    state.clearResult(msg);
                    state.getBreakFn(msg)();
                    state.clearBreakFn(msg);
                    isSync && clearArrayStartResolve(msg);
                    timeout && clearTimeout(timeout);
                    return node.send([null, finalMsg]);
                }

                !timeout && config.timeout > 0 && (timeout = setTimeout(() => {
                    if (msg.originalMsg) {
                        msg = msg.originalMsg;
                    }
                    state.clearResult(msg);
                    msg.payload = {error: `Did not receive all items from array-map-start after ${config.timeout}ms`};
                    node.send(msg);
                    timeouted = true;
                }, config.timeout));

                if (timeouted) return;

                if (msg._isArrayMapError === true || msg.totalItemsAmount === undefined) {
                    const orgError = msg.error || 'Unknown error';
                    state.clearResult(msg);
                    isSync && clearArrayStartResolve(msg);
                    if (msg.originalMsg) {
                        const req = msg.req;
                        const res = msg.res;
                        msg = msg.originalMsg;
                        msg.res = res;
                        msg.req = req;
                    }
                    if (msg._isArrayMapError) {
                        msg.payload = {
                            error: orgError
                        }
                    } else {
                        msg.payload = {
                            error: 'It seems like, you accidentally deleted totalItemsAmount from message, do not do it please.'
                        }
                    }
                    node.send(msg);
                }

                state.addToResult(msg);
                isSync && callArrayStartResolve(msg);
                if (state.isFinished(msg)) {
                    try {
                        const finalMsg = {
                            ...(msg.originalMsg || {}),
                            [resultField]: state.getResult(msg, filterEmpty),
                            req: msg.req,
                            res: msg.res
                        };
                        state.clearResult(msg);
                        isSync && clearArrayStartResolve(msg);
                        node.send(finalMsg);
                        clearTimeout(timeout);
                    } catch (e) {
                        console.log('cannot send result msg after map', e);
                    }
                }
            });
        }
    }

    function ArrayBreak() {
        return function (config) {
            RED.nodes.createNode(this, config);
            const node = this;
            this.config = RED.nodes.getNode(config.config);

            node.on('input', msg => {
                msg.__arrayMapBreakFlag = true;
                msg.__breakPayload = msg.payload;
                node.send(msg);
            })
        }
    }

    RED.nodes.registerType("array-map-end", ArrayMapEnd());
    RED.nodes.registerType("array-map-end-sync", ArrayMapEnd({isSync: true}));
    RED.nodes.registerType("array-map-break", ArrayBreak());
};
