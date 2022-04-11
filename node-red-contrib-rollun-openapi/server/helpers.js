"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findSchema(RED, configId) {
    var node = RED.nodes.getNode(configId);
    return node ? node.schema : undefined;
}
exports.findSchema = findSchema;
function findRouter(RED, configId) {
    var node = RED.nodes.getNode(configId);
    return node ? node.router : undefined;
}
exports.findRouter = findRouter;
