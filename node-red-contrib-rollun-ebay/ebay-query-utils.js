const _ = require('lodash');

function getQueryParamType(value) {
  if (!value) return 'empty';
  if (value.from) return 'datetime';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string' || typeof value === 'number') return 'primitive';
  return 'unknown';
}

function stringifyDatetime(name, {from, to = ''}, isInner = true) {
  return `${name}${isInner ? ':' : '='}[${from}..${to}]`;
}

function stringifyArray(name, value, isInnerArray = false) {
  return `${name}${isInnerArray ? ':' : '='}${value.join(',')}`
}

function stringifyObject(name, value) {
  return `${name}=${Object.entries(value)
    .filter(([, value]) => value && _.size(value) > 0)
    .map(([key, value]) => {
      const valueType = getQueryParamType(value);

      if (valueType === 'datetime') {
        return stringifyDatetime(key, value);
      }
      if (valueType === 'array') {
        return stringifyArray(key, value, true);
      }
      if (valueType === 'primitive') {
        return stringifyPrimitive(key, value, true);
      }
      return `${key}=${value}`;
    }).join(',')}`
}

function stringifyPrimitive(name, value, isInner = false) {
  if (isInner) {
    return `${name}:{${value}}`;
  }
  return `${name}=${value}`;
}

function stringifyQuery(query) {
  return Object.entries(query)
    .filter(([, value]) => value && (typeof value === 'number' || _.size(value) > 0))
    .map(([name, value]) => {
      switch (getQueryParamType(value)) {
        case 'datetime':
          return stringifyDatetime(name, value, false);
        case 'array':
          return stringifyArray(name, value);
        case 'object':
          return stringifyObject(name, value);
        case 'primitive':
          return stringifyPrimitive(name, value)
        default:
          return `${name}=${value}`
      }
    }).join('&');
}

module.exports = {
  stringifyArray,
  stringifyDatetime,
  stringifyObject,
  stringifyPrimitive,
  stringifyQuery
};
