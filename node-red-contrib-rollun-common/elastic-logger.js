const { ElasticLogger, getTypedFieldValue, parseTypedInput } = require('./1-global-utils');

const log_levels = {
  debug: { value: 0, name: 'debug', description: '' },
  notice: { value: 1, name: 'notice', description: '' },
  info: { value: 2, name: 'info', description: '' },
  warning: { value: 3, name: 'warning', description: '' },
  error: { value: 4, name: 'error', description: '' },
  alert: { value: 5, name: 'alert', description: '' },
  critical: { value: 6, name: 'critical', description: '' },
  emergency: { value: 7, name: 'emergency', description: '' },
}

function cleanUpMessage(msg) {
  const propsToFilter = ['req', 'res'];
  propsToFilter.forEach(prop => {
    msg[prop] && (delete msg[prop]);
  });
  return msg;
}

module.exports = function (RED) {
  function ElasticLoggerNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);

    const logger = new ElasticLogger({
      index_name: process.env.SERVICE_NAME || 'default_node_red_log',
      host: node.config.logstashHost,
      port: node.config.logstashPort
    });

    node.on('close', () => logger.destroy());

    node.on('input', async function (msg) {
      const logLevel = msg.level || config.level;
      const { value: minLogLevelValue } = Object.values(log_levels).find(({ name }) => name === node.config.minLevel);
      const level = Object.values(log_levels).find(({ name }) => name === logLevel);

      // in passed level is not standard, log anyway
      if (!level || level.value >= minLogLevelValue) {
        const message = getTypedFieldValue(msg, config.messageField);
        const [, value] = parseTypedInput(config.contextField);
        const context = value
          // if context field specified, get object from it
          ? getTypedFieldValue(msg, config.contextField)
          // if no, use msg as context
          : cleanUpMessage(msg);

        try {
          if (typeof message !== 'string') throw new Error(`message must be of type string - ${typeof message} given!`);
          await logger.withMsg(msg)(logLevel, message || 'default message', context || {});
        } catch (err) {
          node.warn({
            topic: `Could not log message: ${err.message}.`,
            message, context
          })
        }
      }
    });
  }

  RED.nodes.registerType("elastic-logger", ElasticLoggerNode);
}

module.exports.ElasticLogger = ElasticLogger;
