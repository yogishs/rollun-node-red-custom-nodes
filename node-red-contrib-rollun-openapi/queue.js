"use strict";
const { getLifecycleToken } = require('node-red-contrib-rollun-backend-utils');

const requests = {};

function enqueue(msgid, req, res, next) {
  const { lToken, plToken } = getLifecycleToken({ req, _msgid: msgid });
  requests[lToken] = {
    id: lToken,
    req: req,
    res: res,
    next: next,
  };
  return { plToken, lToken };
}

exports.enqueue = enqueue;

function dequeue(id, handler) {
  const ctx = requests[id];
  if (!ctx) {
    throw new Error('internal req object was not found by msgid.');
  }
  const { req, res, next } = ctx;
  try {
    handler(req, res, next);
  } catch (e) {
    next(e);
    console.log(e);
  } finally {
    delete requests[id];
  }
}

exports.dequeue = dequeue;
