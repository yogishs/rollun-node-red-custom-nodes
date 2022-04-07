"use strict";


window.utils = {
  // for this to work in form need to be
  // hidden input with node-input-{name}   id      <input type="hidden" id="node-input-partNumber">
  // and input with node-input-{name}-view id      <input type="text" id="node-input-partNumber-view">
  // or just container with id as {name}
  makeTypedInput: (name, types = [{
    value: "msg",
    label: "msg."
  }, {
    value: "const",
    label: "constant"
  }], displayName, defaultValue) => {
    $(`#${name}`)
      .html(`
         <label style="margin-right: 10px; margin-bottom: 10px" for="node-input-${name}-view">${displayName || name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/\s+/)
        .map((word, idx) => idx === 0 ? (word[0].toUpperCase() + word.slice(1)) : word.toLowerCase())
        .join(' ')
      }</label>
                  <input type="hidden" value="${defaultValue || ''}" id="node-input-${name}">
                  <input style="width: 100%" type="text" id="node-input-${name}-view">
              `)
    const [type, value] = (defaultValue || $(`#node-input-${name}`).val()).split('|');
    $(`#node-input-${name}-view`)
      .typedInput({types: types})
      .typedInput('value', value)
      .typedInput('type', type)
      .on('change', (e, type) => {
        if (type === true) return;

        $(`#node-input-${name}`).val(`${type}|${e.target.value}`);
      });
  },
  last: (array = []) => array[array.length - 1],
  debounce: function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  datastore: class Datastore {
    constructor(baseUrl = '') {
      this.baseUrl = baseUrl;
    }

    _stringifyGet(params = {}) {
      return Object
        .entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join('&');
    }

    _request(method, uri, {body, params = {}} = {}) {
      return fetch(this.baseUrl + uri + '?' + (typeof params === 'string' ? params : this._stringifyGet(params)), {
        method: method,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
        .then(res => res.json())
        .then(res => res.error ? Promise.reject(res.error) : res);
    }

    get(uri, params = {}) {
      return this._request('GET', uri, {params});
    }

    post(uri, body = {}, params = {}) {
      return this._request('POST', uri, {body, params});
    }

    // put: function () {throw new Error('Not implemented yet')},
    // delete: function () {throw new Error('Not implemented yet')},
  }
}
