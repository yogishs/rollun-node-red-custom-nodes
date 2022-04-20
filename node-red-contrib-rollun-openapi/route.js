"use strict";
const _ = require('lodash');

function toExpressParams(part) {
    return part.replace(/\{([^}]+)}/g, ':$1');
}
function getOperation(schema, op) {
    const [method, path] = op.split(' ');
    const pathKey = Object.keys(schema.paths).find(p => p === path);
    if (pathKey) {
        const pathObj = schema.paths[pathKey];
        const resultMethod = Object.keys(pathObj).find(m => m === method);
        if (resultMethod) {
            const methodObj = pathObj[resultMethod];
            return {
                method: method,
                schema: methodObj,
                path: pathKey,
                expressPath: toExpressParams(pathKey),
                pathSchema: pathObj,
            }
        }
    }
}
function openApiRoute({ router, schema, operation, handler }) {
    const spec = getOperation(schema, operation);
    if (!spec) {
        throw new Error("Invalid operation name: " + operation);
    }
    const route = router[spec.method];
    if (typeof route !== 'function') {
        throw new Error("Invalid method name: " + operation + "." + spec.method);
    }
    const expressPath = spec.path
        .substring(1)
        .split('/')
        .map(toExpressParams)
        .join('/');

    const baseUrl = _.get(schema, 'servers[0].url') || '';
    const prefix = baseUrl.replace(/^https?:\/\/[a-z0-9\-_]+/, '');
    route.call(router, `${prefix}/${expressPath}`, handler);
    return function () {
        router.stack.forEach(function (route, i, routes) {
            if (route.handle === router) {
                routes.splice(i, 1);
            }
        });
    };
}
exports.openApiRoute = openApiRoute;
