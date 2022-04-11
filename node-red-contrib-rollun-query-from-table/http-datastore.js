const url = require('url');
const { resolvePath, getLifecycleToken, defaultLogger } = require('node-red-contrib-rollun-backend-utils');

class HttpDatastoreError extends Error {
  constructor(message, request) {
    super(message);
    this.request = request;
    Error.captureStackTrace(HttpDatastoreError);
  }
}

class HttpDatastore {

  /**
   *
   * @param opts {{URL: string, timeout?: number}}
   * @param timeout {number?}
   */
  constructor({ URL, idField = 'id', timeout = 10000, msg = {}, logRequest = false }) {
    if (!URL) throw new Error('Url is required.');
    const { protocol, host, pathname } = url.parse(URL);
    if (!host) throw new Error(`url is not in valid format! [${URL}]`);

    /**
     * MSG object, used to resolve variables in RQL string using Datastore.resolveRQLWithREDMsg
     * @type {object}
     */

    this.msg = msg;

    /**
     * @type {string}
     */

    this.idField = idField;

    /**
     * @type {string}
     */

    this.pathname = pathname || '';

    /**
     * @type {AxiosInstance}
     */

    const { lToken, plToken } = getLifecycleToken(msg);
    this.axios = require('axios').create({
      baseURL: `${protocol}//${host}`,
      timeout,
      headers: {
        'content-type': 'application/json',
        lifecycle_token: lToken,
        parent_lifecycle_token: plToken,
      }
    });

    if (logRequest) {
      this.axios.interceptors.request.use((config) => {
        defaultLogger.withMsg(msg)('info', `Request to datastore`, {
          request: config.url,
          method: config.method,
          body: config.body,
          datastore: URL,
        });
        return config;
      });
    }
  }

  /**
   *
   * @param rql {string}
   * @returns {string}
   */

  parseRql(rql) {
    if (rql === '') {
      return '';
    }

    const resolved = HttpDatastore.resolveRQLWithREDMsg(rql, this.msg);

    return fixRqlEncoding(resolved);
  }

  /**
   * example:
   *     if string contains path relative to msg (e.g. msg.rlln.mp.order.id), with given args
   *      rql = select(id)&limit(20,0)&like(mp_order_id,string:msg.rlln.mp.order.id)
   *      msg = {rlln: {mp: {order: "123456"}}}
   *     will be resolved to
   *     select(id)&limit(20,0)&like(mp_order_id,string:123456)
   * @param rql {string}
   * @param msg {*}
   */

  static resolveRQLWithREDMsg(rql, msg = {}) {
    return rql.trim()
      // remove trailing ?
      .replace(/^\?/, '')
      // resolve path
      .replace(/msg\.[a-zA-Z0-9.]+/g, match => {
        const path = match.replace(/^msg\./, '');
        return HttpDatastore.encodeRQLValue(resolvePath(msg, path));
      })
  }

  /**
   *
   * @param value {string}
   */

  static encodeRQLValue(value) {
    let encodedValue = encodeURIComponent(value);
    while (encodedValue.match(/[()\-_.~!*']/g)) {
      encodedValue = encodedValue
        .replace('(', '%28')
        .replace(')', '%29')
        .replace('-', '%2D')
        .replace('_', '%5F')
        .replace('.', '%2E')
        .replace('~', '%7E')
        .replace('*', '%2A')
        .replace('\'', '%27')
        .replace('!', '%21');
    }
    return encodedValue;
  }

  /**
   *
   * @param promise {Promise<*>}
   * @param fullResponse {boolean}
   * @private
   * @return {Promise<*>}
   */

  static _withResponseFormatter(promise, fullResponse = false) {
    return promise
      .then(res => {
        if (res.error) throw new HttpDatastoreError(res.error, res.config);
        return fullResponse ? res : res.data
      })
      // rethrow error, with different message, if key error exists in response
      .catch(err => {
        if (err.response && err.response.data) {
          if (err.response.data.error) {
            throw new HttpDatastoreError(err.response.data.error, err.config);
          }
          throw new HttpDatastoreError(JSON.stringify(err.response.data), err.config);
        }
        throw new HttpDatastoreError(err.message, err.config);
      });
  }

  /**
   * returns path without trailing slash and adds start slash
   * @param uri
   * @return {string}
   * @private
   */

  static _getUri(uri) {
    if (!uri) return '';
    return `/${uri
      .replace(/^\//, '')
      .replace(/\/$/, '')}`;
  }

  /**
   *
   * @param uri
   * @param rql
   * @param fullResponse
   * @return {Promise<[]*>}
   */

  async query(uri, rql = '', fullResponse = false) {
    return HttpDatastore._withResponseFormatter(this.axios
        .get(`${this.pathname}${HttpDatastore._getUri(uri)}?${this.parseRql(rql)}`),
      fullResponse
    );
  }

  /**
   *
   * @param uri
   * @param rql
   * @param fullResponse
   * @return {Promise<[]*>}
   */

  async getFirst(uri, rql = '', fullResponse = false) {
    return HttpDatastore._withResponseFormatter(this.axios
        .get(`${this.pathname}${HttpDatastore._getUri(uri)}?${this.parseRql(rql)}`)
        .then(result => {
          if (result.data && result.data.length > 0) {
            result.data = result.data[0];
          } else {
            result.data = null;
          }
          return result;
        }),
      fullResponse
    );
  }

  async read(uri, id, fullResponse = false) {
    return HttpDatastore._withResponseFormatter(this.axios
        .get(`${this.pathname}${HttpDatastore._getUri(uri)}/${encodeURI(id)}`),
      fullResponse
    );
  }


  /**
   *
   * @param uri
   * @param body {string | object | [] | number | boolean}
   * @param fullResponse
   * @return {Promise<*>}
   */

  async create(uri, body, fullResponse = false) {
    return HttpDatastore._withResponseFormatter(this.axios
        .post(`${this.pathname}${HttpDatastore._getUri(uri)}`, body),
      fullResponse
    );
  }

  /**
   *
   * @param uri
   * @param body {string | object | [] | number | boolean}
   * @param fullResponse
   * @return {Promise<*>}
   */

  async update(uri, body, fullResponse = false) {
    const id = body[this.idField];
    if (!id) {
      throw new Error(`Id field with name [${this.idField}] is empty or does not exist in body!`);
    }
    return HttpDatastore._withResponseFormatter(this.axios
        .put(`${this.pathname}${HttpDatastore._getUri(uri)}`, body),
      fullResponse
    );
  }

  /**
   *
   * @param uri
   * @param id {string}
   * @param fullResponse
   * @return {Promise<*>}
   */

  async delete(uri, id, fullResponse = false) {
    return HttpDatastore._withResponseFormatter(this.axios
        .delete(`${this.pathname}${HttpDatastore._getUri(uri)}/${id}`),
      fullResponse
    );
  }
}

function fixRqlEncoding(rql) {
  return rql
    .split('&')
    .map((node) => {
      if (node.startsWith('sort(')) {
        return node;
      }

      /**
       * RegExp to test a string for a ISO 8601 Date spec
       *  YYYY
       *  YYYY-MM
       *  YYYY-MM-DD
       *  YYYY-MM-DDThh:mmTZD
       *  YYYY-MM-DDThh:mm:ssTZD
       *  YYYY-MM-DDThh:mm:ss.sTZD
       *  YYYY-MM-DD hh:mm:ss - non ISO8601 format
       */

      const almostISORegex = /\d{4}(-\d\d(-\d\d([T ]\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?/gi;

      return node
        .replace(almostISORegex, (match) => encodeURIComponent(match))
        .replace(/-/g, '%2D')
        .replace(/_/g, '%5F')
        .replace(/\./g, '%2E')
        .replace(/~/g, '%7E');
    })
    .join('&');
}

module.exports = { HttpDatastore };
