const _ = require('lodash');
const {getTypedFieldValue} = require('../node-red-contrib-common-utils/1-global-utils');
const {randomString} = require('rollun-ts-utils');

/**
 *  @deprecated
 * This class holds state for array-start and array-end nodes
 */

class ArrayMapState {

  constructor(RED) {
    this.RED = RED;

    // map - [_msgif]: array|object of results
    // DO NOT MODIFY DIRECTLY
    this.arrayMapResults = {};

    // map - [_msgif]: function to stop iteration
    this.breakFn = {};

    // map - [_msgid]: function to continue iteration
    this.resolveFn = {};

  }

  addToResult({payload, _msgid, type, key}, customResult) {
    if (!this.arrayMapResults[_msgid]) {
      this.arrayMapResults[_msgid] = type === 'array' ? [] : {};
    }
    if (type === 'array') {
      this.arrayMapResults[_msgid].push(customResult || payload);
    } else {
      if (!key) {
        key = this.RED.util.generateId()
      }
      this.arrayMapResults[_msgid][key] = customResult || payload;
    }
  };

  isFinished({_msgid, totalItemsAmount, type}) {
    if (type === 'array') {
      return this.arrayMapResults[_msgid].length === totalItemsAmount
    }
    return Object.keys(this.arrayMapResults[_msgid]).length === totalItemsAmount;
  };

  initResult({_msgid, type}) {
    this.arrayMapResults[_msgid] = type === 'array' ? [] : {};
  }

  isIterationInProgress({_msgid}) {
    return this.arrayMapResults[_msgid];
  }

  getResult({_msgid, type}, filterEmpty = false) {
    const toDel = (val) => val !== null && val !== undefined;
    if (type === 'array') {
      const arr = this.arrayMapResults[_msgid] || [];
      return filterEmpty
        ? arr.filter(toDel)
        : arr
    }
    if (type === 'object') {
      const obj = this.arrayMapResults[_msgid] || {};
      return filterEmpty
        ? Object.entries(obj)
          .filter(([, val]) => toDel(val))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
        : obj
    }
  };

  clearResult({_msgid}) {
    if (this.arrayMapResults[_msgid]) {
      delete this.arrayMapResults[_msgid];
    }
  };

  addBreakFn({_msgid}, breakFn) {
    this.breakFn[_msgid] = breakFn;
  }

  getBreakFn({_msgid}) {
    return this.breakFn[_msgid];
  }

  clearBreakFn({_msgid}) {
    if (this.breakFn[_msgid]) {
      delete this.breakFn[_msgid];
    }
  }

  addResolveFn({_msgid}, resolveFn) {
    this.resolveFn[_msgid] = resolveFn;
  }

  clearResolveFn({_msgid}) {
    if (this.resolveFn[_msgid]) {
      delete this.resolveFn[_msgid];
    }
  }

  getResolveFn({_msgid}) {
    return this.resolveFn[_msgid];
  }
}

class ForEachState {
  constructor() {
    // map - [metaInfoKey]: array|object of results
    this.results = {};

    // map - [metaInfoKey]: function to stop iteration
    this.breakFn = {};

    // map - [metaInfoKey]: function to continue iteration
    this.resolveFn = {};

  }

  addToResult(msg, metaInfoKey, arrayField) {
    const {_msgid} = msg;
    const {type, key} = msg[metaInfoKey];
    const result = getTypedFieldValue(msg, arrayField);

    if (!this.results[metaInfoKey]) {
      this.initResult({_msgid, key}, metaInfoKey);
    }
    if (type === 'array') {
      this.results[metaInfoKey].push(result);
    }
    if (type === 'object') {
      const objectKey = key || randomString(10);
      this.results[metaInfoKey][objectKey] = result;
    }
  };

  initResult(msg, metaInfoKey) {
    const {type} = msg[metaInfoKey];
    this.results[metaInfoKey] = type === 'array' ? [] : {};
  }

  isIterationInProgress({_msgid}, metaInfoKey) {
    return !!this.results[metaInfoKey];
  }

  getResult(msg, metaInfoKey, filterEmpty = false) {
    const toDel = (val) => val !== null && val !== undefined;
    const {type} = msg[metaInfoKey];

    if (type === 'array') {
      const arr = this.results[metaInfoKey] || [];
      return filterEmpty
        ? arr.filter(toDel)
        : arr
    }
    if (type === 'object') {
      const obj = this.results[metaInfoKey] || {};
      return filterEmpty
        ? Object.entries(obj)
          .filter(([, val]) => toDel(val))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {})
        : obj
    }
  };

  clearResult({_msgid}, metaInfoKey) {
    if (this.results[metaInfoKey]) {
      delete this.results[metaInfoKey];
    }
  };

  //
  addBreakFn({_msgid}, metaInfoKey, breakFn) {
    this.breakFn[metaInfoKey] = breakFn;
  }

  getBreakFn({_msgid}, metaInfoKey) {
    return this.breakFn[metaInfoKey];
  }

  clearBreakFn({_msgid}, metaInfoKey) {
    if (this.breakFn[metaInfoKey]) {
      delete this.breakFn[metaInfoKey];
    }
  }

  addResolveFn({_msgid}, metaInfoKey, resolveFn) {
    this.resolveFn[metaInfoKey] = resolveFn;
  }

  clearResolveFn({_msgid}, metaInfoKey) {
    if (this.resolveFn[metaInfoKey]) {
      delete this.resolveFn[metaInfoKey];
    }
  }

  getResolveFn({_msgid}, metaInfoKey) {
    return this.resolveFn[metaInfoKey];
  }
}

module.exports = {
  ArrayMapState,
  ForEachState
};
