'use strict';
const queue = require('./queue');
const {
  getLifecycleToken,
  resolvePayload,
  defaultLogger,
} = require('node-red-contrib-rollun-backend-utils');

function getStatusCodeFromMessages(messages) {
  const errorExists = messages.some((m) => m.level === 'error');
  return errorExists ? 500 : 200;
}

module.exports = function register(RED) {
  RED.nodes.registerType('rollun-openapi-out', function openapiOutNode(props) {
    const _this = this;
    RED.nodes.createNode(this, props);

    this.on('input', function (msg) {
      try {
        const { lToken, plToken } = getLifecycleToken(msg);

        if (!lToken) {
          _this.error('Lifecycle token not found');
          return;
        }

        const {
          data,
          messages = [],
          statusCode,
        } = resolvePayload(msg, {
          data: props.data,
          messages: props.messages,
          statusCode: props.statusCode,
        });

        let msgs = messages;
        if (!props.disableGenerationOfExceptionMessage && msg.error) {
          const {
            message = 'Unknown Error',
            source: { id, type } = { id: 'unknown', type: 'unknown' },
          } = msg.error;
          msgs = [
            {
              level: 'error',
              // type: 'NODE_RED_NODE_EXCEPTION',
              type: 'UNDEFINED',
              text: `Caught exception in node ${id} of type ${type} with message: '${message}'`,
            },
          ].concat(msgs);
        }

        const code = statusCode || getStatusCodeFromMessages(messages);

        queue.dequeue(lToken, function (req, res, __) {
          res.set('lifecycle_token', lToken);
          res.set('parent_lifecycle_token', plToken || '');

          console.log('res', data, msgs);
          res
            .status(code)
            .send(
              data && msgs.length > 0 ? { data, messages: msgs } : undefined
            );
          res.on('finish', () => {
            if (!res.errorLogged) {
              defaultLogger.withMsg(msg)(
                'info',
                `OpenAPIServerRes: ${req.method} ${req.path}`,
                { status: code, messages: msgs }
              );
            }
          });
        });
      } catch (err) {
        console.log(err);
        _this.error(err);
      }
    });
  });
};
