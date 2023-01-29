'use strict';
const _ = require('lodash');
const queue = require('./queue');
const { defaultLogger } = require('node-red-contrib-rollun-backend-utils');

function toExpressParams(part) {
  return part.replace(/\{([^}]+)}/g, ':$1');
}
function getOperation(schema, op) {
  const [method, path] = op.split(' ');
  const pathKey = Object.keys(schema.paths).find((p) => p === path);
  if (pathKey) {
    const pathObj = schema.paths[pathKey];
    const resultMethod = Object.keys(pathObj).find((m) => m === method);
    if (resultMethod) {
      const methodObj = pathObj[resultMethod];
      return {
        method: method,
        schema: methodObj,
        path: pathKey,
        expressPath: toExpressParams(pathKey),
        pathSchema: pathObj,
      };
    }
  }
}

function openApiRequestHandlerFactory(RED, node) {
  return function (req, res, next) {
    const msgid = RED.util.generateId(req, res, next);
    const { lToken, plToken } = queue.enqueue(msgid, req, res, next);
    req.plToken = plToken;
    req.lToken = lToken;
    defaultLogger.withMsg({ req })(
      'info',
      `OpenAPIServerReq: ${req.method} ${req.path}`,
      {
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      }
    );
    const msg = {
      _msgid: msgid,
      openapiRequest: {
        lToken,
        plToken,
        remoteAddress: req.socket.remoteAddress,
        cookies: req.cookies,
        headers: req.headers,
        params: req.params,
        path: req.path,
        url: req.url,
        payload: req.body,
        query: req.query,
      },
    };
    node.send(msg);
  };
}

function openApiRoute({ router, schema, operation, node, RED }) {
  const spec = getOperation(schema, operation);

  if (!spec) {
    throw new Error('Invalid operation name: ' + operation);
  }
  const route = router[spec.method];
  if (typeof route !== 'function') {
    throw new Error('Invalid method name: ' + operation + '.' + spec.method);
  }
  const expressPath =
    '/' + spec.path.substring(1).split('/').map(toExpressParams).join('/');

  // const validator = new OpenApiValidator(schema, {
  //   ajvOptions: { strict: 'log' },
  // });

  console.log(`register openapi route for ${operation}`, expressPath);
  route.call(
    router,
    expressPath,
    // validator.validate(spec.method, expressPath),
    openApiRequestHandlerFactory(RED, node)
  );
}
exports.openApiRoute = openApiRoute;
