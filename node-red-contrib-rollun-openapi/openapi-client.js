const OpenAPIRequestValidator = require('openapi-request-validator').default;
const axios = require('axios');
const {
  getLifecycleToken,
  defaultLogger,
  getTypedFieldValue
} = require('node-red-contrib-rollun-backend-utils');

module.exports = function (RED) {
  function openApiRed(config) {
    RED.nodes.createNode(this, config)
    const node = this;

    function sendError(msg, text) {
      msg.payload = {
        error: text,
      }
      return node.send([msg]);
    }

    node.on('input', async function (msg) {
      const configNode = RED.nodes.getNode(config.schema)
      const schema = configNode ? configNode.schema : null;  

      if (!schema) {
        return sendError(msg, 'No openapi schema selected.');
      }

      const [method, methodName] = config.operation.split(' ');

      const endpointConfig = schema.paths[methodName][method];
      if (!endpointConfig) {
        return sendError(msg, `No method found by operation ${config.operation}`);
      }

      console.log(endpointConfig, schema.components.schemas);
      const validator = new OpenAPIRequestValidator({
        ...endpointConfig,
        schemas: schema.components.schemas,
      });

      const headers = getTypedFieldValue(msg, config.headers);
      const { lToken, plToken } = getLifecycleToken(msg);
      const request = {
        headers: {
          'content-type': 'application/json',
          lifecycle_token: lToken,
          ...(plToken && { parent_lifecycle_token: plToken }),
          ...headers,
        },
        body: getTypedFieldValue(msg, config.body) || {},
        params: getTypedFieldValue(msg, config.params) || {},
        query: getTypedFieldValue(msg, config.query) || {},
      }

      if (!config.disableValidation) {
        try {
          const validationResult = validator.validateRequest(request);
          if (validationResult) {
            const { status, errors = [] } = validationResult;
            msg.payload = {
              status,
              headers: {},
              body: {
                data: null,
                messages: errors.map(({ location = '', path, message }) => ({
                  level: 'error',
                  type: 'OPENAPI_REQUEST_VALIDATION_ERROR',
                  text: `[${location}.${path}] ${message}`,
                })),
              }
            }
            return node.send([msg]);
          }
        } catch (e) {
          return sendError(msg, e.message);
        }
      }

      let requestConfig;
      const server = schema.servers[+config.server];
      try {
        if (!server) {
          throw new Error(`no 'server' found in servers by index ${config.server} in openapi manifest.`)
        }
        let url = server.url + methodName;
        url = url.replace(/{.+}/g, (match) => {
          const paramName = match.slice(1, -1);
          const value = request.params[paramName];
          if (!value) {
            throw new Error(`value for param ${match} not found in params.`);
          }
          return value;
        });
        requestConfig = {
          url,
          method: method.toUpperCase(),
          headers: request.headers,
          data: request.body,
          params: request.query,
        }
        defaultLogger.withMsg(msg)(
          'info',
          `OpenAPIClientReq: ${requestConfig.method} ${url}`,
          { ...requestConfig },
        );
        const { status, headers, data } = await axios(requestConfig);
        defaultLogger.withMsg(msg)(
          'info',
          `OpenAPIClientRes: ${requestConfig.method} ${requestConfig.url}`,
          { status, headers, messages: data.messages },
        );
        msg.payload = {
          status,
          headers,
          requestConfig: {
            method,
            url: requestConfig.url,
            body: requestConfig.data,
            query: request.query,
            params: request.params,
            headers: request.headers,
          },
          data,
        };
        node.send([null, msg]);
      } catch (e) {
        const defaultMessage = {
          level: 'error',
          // type: 'UNKNOWN_REQUEST_ERROR',
          type: 'UNDEFINED',
          message: e.message,
        }
        const { response = {} } = e;
        const { data = null, messages = [defaultMessage] } = response.data || {};
        console.log(response.data, response.status, response.headers);
        msg.payload = {
          status: response.status || 'UNKNOWN',
          requestConfig: {
            method,
            url: (requestConfig && requestConfig.url) || server.url + methodName,
            body: (requestConfig && requestConfig.data) || request.body,
            query: request.query,
            params: request.params,
            headers: request.headers,
          },
          headers: {},
          body: {
            data,
            messages,
          }
        }
        defaultLogger.withMsg(msg)(
          'error',
          `OpenAPIClientRes: ${requestConfig && requestConfig.method} ${requestConfig && requestConfig.url}`,
          { status: e.status || 'UNKNOWN', ...(requestConfig || {}), messages, response: response.data, stack: e.stack},
        );
        return node.send([msg]);
      }
    })
  }

  RED.nodes.registerType('rollun-openapi-client', openApiRed)
}
