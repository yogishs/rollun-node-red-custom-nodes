const fs = require('fs');
const URL = require('url');
const Axios = require('axios');
const crypto = require('crypto');

class MegaplanAPIV3Client {
  /**
   *
   * @param config {{password: string, email: string, host: string}}
   */
  constructor(config) {
    this.email = config.email;
    this.password = config.password;

    this.axios = Axios.create({ baseURL: config.host });
    const hash = crypto
      .createHash('sha256')
      .update(this.email + this.password)
      .digest()
      .toString('hex');
    this.cacheFileName = `./${hash}-megaplan-auth-token.json`;
    this.axios.interceptors.request.use(async config => {
      if (config.url === 'api/v3/auth/access_token') return config;
      const token = await this._getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    })

  }


  /**
   *
   * @returns {null|string}
   * @private
   */
  _getCachedToken() {
    try {
      if (fs.existsSync(this.cacheFileName)) {
        const file = fs.readFileSync(this.cacheFileName, 'utf8');
        const data = JSON.parse(file);
        if (!data.access_token || !data.expires_in || !data.created_at) {
          throw new Error('invalid file format - ' + file);
        }
        if ((Date.now() / 1000 - data.created_at) > data.expires_in) {
          throw new Error(`Token expired - now(${Date.now()}) - created at(${data.created_at}) = ${Date.now() / 1000 - data.created_at} > expires in(${data.expires_in})`)
        }
        return data.access_token;
      }
    } catch (err) {
      return null;
    }
  }

  async _getAuthToken() {
    const cachedToken = this._getCachedToken();
    if (cachedToken) {
      return cachedToken;
    }
    const data = {
      username: this.email,
      password: this.password,
      grant_type: 'password'
    };

    const payload = Object.entries(data).map(([key, val]) => `--12345
Content-Disposition: form-data; name="${key}"

${val}`).join('\n');

    const result = await this.axios.post('api/v3/auth/access_token', payload, {
      headers: {
        'content-type': 'multipart/form-data; boundary=12345'
      }
    });
    fs.writeFileSync(this.cacheFileName, JSON.stringify({
      ...result.data,
      created_at: Math.floor(Date.now() / 1000)
    }))
    return result.data.access_token;
  }

  /**
   * Return entity id, supports id itself and link to entity in megaplan UI.
   */

  getEntityId(idString) {
    // if it is id itself
    if (/^[0-9]+$/.test(idString.toString())) {
      return idString;
    }
    try {
      // if it is URL
      const { pathname } = URL.parse(idString);
      const [match] = pathname.match(/[0-9]+/);
      return match;
    } catch (e) {
      console.log('Invalid id', e)
      return idString;
    }

  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @return {Promise<void>}
   */

  async sendRequestMetric(method, url) {
    /**
     *
     * @param method {string}
     * @param url {string}
     * @return {string}
     */

    const formatUrl = (method, url) => {
      const [baseUrl] = url.split('?');
      const cleanBaseUrl = baseUrl.replace(/^\//, '').replace(/\/[0-9]+/g, '/{id}');
      return `${method.toLowerCase()} /${cleanBaseUrl}`;
    };

    try {
      await Axios.post('http://megaplan-union/api/webhook/MetricCounter', {
        count: 1,
        service: process.env.SERVICE_NAME,
        action: formatUrl(method, url),
      });
    } catch (e) {
      console.error('MegaplanSdk: Unable to write megaplan request metric', {
        error: e.stack,
        response: e.response && e.response.data,
      });
    }
  }

  /**
   *
   * @param method - get, post, etc.
   * @param url
   */

  async baseRequest(method, url, body) {
    try {
      this.sendRequestMetric(method, url);
      const { data } = await this.axios[method](url, body);
      return data;
    } catch (err) {
      const { response } = err || {};

      if (err.isAxiosError && response) {
        const { meta } = response.data || {};
        if (!meta || !meta.errors || meta.errors.length === 0) return err.message;

        const [error] = meta.errors;

        throw new Error(`MP error - ${meta.status}, ${error.field ? error.field : 'Message'}: ${error.message}`);
      }
      throw err;
    }
  }

  /**
   *
   * @param name
   * @param idString - link or id
   * @return {Promise<*>}
   */

  async getEntity(name, idString) {
    const [entity, action] = name.split('.');

    const defaultFilters = {
      'deal.linkedDeals': {
        "fields": [
          // common fields

          "positions", "program", "contractor",

          // Order deal specific fields

          "Category1000072CustomFieldMpName",
          "Category1000072CustomFieldMpClientId",
          "Category1000072CustomFieldMpOrderNumber",
          "Category1000072CustomFieldMpShipMethod",
          "Category1000072CustomFieldMpOrderItemId",
          "Category1000072CustomFieldMpOrderNote",
          "Category1000072CustomFieldDateCrPayed",
          "Category1000072CustomFieldDateShipBy",
          "Category1000072CustomFieldDateDeliverBy",
          "Category1000072CustomFieldCogs",
          "Category1000072CustomFieldProfit",
          "Category1000072CustomFieldTracknumber",
          "Category1000072CustomFieldProblemDescription",
          "Category1000072CustomFieldHowToBuy3",
          "Category1000072CustomFieldHowToBuy3Result",

          // Dropship deal specific fields

          "Category1000073CustomFieldMpName",
          "Category1000073CustomFieldMpOrderNumber",
          "Category1000073CustomFieldSrName",
          "Category1000073CustomFieldSrShipMethod",
          "Category1000073CustomFieldSrOrderNumber",
          "Category1000073CustomFieldSrPaymentCard",
          "Category1000073CustomFieldTracknumber",
          "Category1000073CustomFieldCarrier",
          "Category1000073CustomFieldDateLabelCreation",
          "Category1000073CustomFieldAdditionalTracknumbers",
          "Category1000073CustomFieldShipStatus",
          "Category1000073CustomFieldProblemDescription",
          "Category1000073CustomFieldEnterTracknumber",
          "Category1000073CustomFieldDateEnteringTracknumberIntoMp",
          "Category1000073CustomFieldTotal",
          "Category1000073CustomFieldSrVirtualName",

          // Pick-up deal specific fields

          "Category1000074CustomFieldMpName",
          "Category1000074CustomFieldMpOrderNumber",
          "Category1000074CustomFieldBagLink",
          "Category1000074CustomFieldSrName",
          "Category1000074CustomFieldSrWorker",
          "Category1000074CustomFieldSrShipMethod",
          "Category1000074CustomFieldTracknumber",
          "Category1000074CustomFieldCarrier",
          "Category1000074CustomFieldWasPacked",
          "Category1000074CustomFieldShipStatus",
          "Category1000074CustomFieldProblemDescription",
          "Category1000074CustomFieldEnterTracknumber",
          "Category1000074CustomFieldDateEnteringTracknumberIntoMp",
          "Category1000074CustomFieldWeight",
          "Category1000074CustomFieldDimensions",
          "Category1000074CustomFieldTotal",
          "Category1000074CustomFieldSrVirtualName",

          // Problem deal specific fields

          "Category1000064CustomFieldUserId",
          "Category1000064CustomFieldMarketplace1",
          "Category1000064CustomFieldOrderNumber",
          "Category1000064CustomFieldSourceOfCommunication",
          "Category1000064CustomFieldHistory",
          "Category1000064CustomFieldSolution",
          "Category1000064CustomFieldSrOrderNumber",
          "Category1000064CustomFieldRmReplacementReturnNumber",
          "Category1000064CustomFieldRmReturnNumber",
          "Category1000064CustomFieldDateOfTheLastActions",
          "Category1000064CustomFieldTrackNumber",
          "Category1000064CustomField4WeWaitFrom",
          "Category1000064CustomField4WeWaitFor",
          "Category1000064CustomFieldSupplierRefundToUs",
          "Category1000064CustomFieldTotal",
          "Category1000064CustomFieldOrderLinkInMegaplan"
        ]
      }
    }

    let actionUrl;
    if (action) {
      actionUrl = `/${action}`;
      if (defaultFilters[name]) {
        actionUrl += `?${JSON.stringify(defaultFilters[name])}`;
      }
    }

    const id = this.getEntityId(idString);

    return this.baseRequest('get', `api/v3/${entity}/${id}${action ? actionUrl : ''}`)
  }

  /**
   *
   * @param name
   * @param idString - link or id
   * @param body
   * @return {Promise<*>}
   */

  async updateEntity(name, idString, body = {}) {
    const id = this.getEntityId(idString);

    return this.baseRequest('post', `api/v3/${name}/${id}`, body);
  }
}

module.exports = { MegaplanAPIV3Client };

