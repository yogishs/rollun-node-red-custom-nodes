const fs = require('fs');
const {randomString} = require('rollun-ts-utils');

class MarketplaceAPI {
  /**
   *
   * @param axios - axios instance, that handles authorization
   */
  constructor(axios) {
    this.axios = axios;
  }

  /**
   *
   * @param uri {string}
   * @param method {"get"|"post"|"delete"|"put"}
   * @param body {*}
   * @return {Promise<*>}
   */

  async baseRequest(uri, method, body = undefined) {
    const {data} = await this.axios[method](uri, body);
    return data;
  }

  async filterRequest(baseUrl, params) {
    const query = params.nextCursor
      ? params.nextCursor
      : Object.entries(params).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
    return this.baseRequest(`${baseUrl}?${query}`, 'get');
  }

  async getOrders(params) {
    return this.filterRequest('/v3/orders', params);
  }

  async getOrder(orderId) {
    return this.baseRequest(`/v3/orders/${orderId}?productInfo=true`, 'get');
  }

  async getReturns(params) {
    return this.filterRequest('/v3/returns', params);
  }
}

module.exports = class WalmartAPI {
  constructor({clientId, clientSecret, correlationId}) {

    this.axios = require('axios').create({
      baseURL: 'https://marketplace.walmartapis.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'WM_SVC.NAME': 'Walmart Marketplace',
        'WM_SVC.VERSION': '1.0.0'
      }
    });

    this.correlationId = correlationId;

    /**
     * @type {{expires_in: number, access_token: string, created_at: number} | null}
     */

    this.authToken = null;

    const hash = Buffer.from(clientId + clientSecret).toString('base64');
    this.cacheFileName = `/data/${hash}-walmart-auth-token.json`;

    this.axios.interceptors.request.use(async config => {
      if (config.url === '/v3/token') return config;
      const token = await this._getAuthToken(clientId, clientSecret);
      config.headers.Authorization = this._getAuthHeader(clientId, clientSecret);
      config.headers['WM_QOS.CORRELATION_ID'] = this.correlationId;
      config.headers['WM_SEC.ACCESS_TOKEN'] = token;
      return config;
    });

    this.marketplace = new MarketplaceAPI(this.axios);
  }

  _getAuthHeader(clientId, clientSecret) {
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }

  async _getAuthToken(clientId, clientSecret) {
    const cachedToken = this._getCachedToken();
    if (cachedToken) {
      return cachedToken;
    }
    const {data} = await this.axios.post('/v3/token', 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this._getAuthHeader(clientId, clientSecret),
        'WM_SVC.NAME': 'Walmart Marketplace',
        'WM_QOS.CORRELATION_ID': this.correlationId,
        'WM_SVC.VERSION': '1.0.0'
      }
    });

    this.authToken = {
      ...data,
      created_at: Math.floor(Date.now() / 1000),
    };

    // cache token on disk
    fs.writeFile(this.cacheFileName, JSON.stringify(this.authToken), (err) => {
      if (err) {
        console.warn('Could cache walmart token on disk');
      }
    });

    return this.authToken.access_token;
  }

  _getCachedToken() {
    const isExpired = data => {
      if (!data.access_token || !data.expires_in || !data.created_at) {
        console.log('invalid file format - ' + data);
        return false
      }
      if ((Date.now() / 1000 - data.created_at) > data.expires_in) {
        console.log(`Token expired - now(${Date.now()}) - created at(${data.created_at}) = ${Date.now() / 1000 - data.created_at} > expires in(${data.expires_in})`)
        return true;
      }
      return false;
    }

    if (this.authToken === null) {
      try {
        this.authToken = JSON.parse(fs.readFileSync(this.cacheFileName, 'utf8'));
      } catch (e) {
        return null;
      }
    }

    return isExpired(this.authToken) ? null : this.authToken.access_token;
  }
}
