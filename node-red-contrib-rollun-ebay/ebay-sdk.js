const fs = require('fs');
const _ = require('lodash');
const Axios = require('axios');
const crypto = require('crypto');
const Taxonomy = require('./ebay-taxonomy-api');
const Sell = require("./ebay-sell-api");
const PostOrder = require('./ebay-post-order-api');

const OAUTH_SCOPES = {
  sell: {
    marketing: 'sell.marketing',
    marketingReadonly: 'sell.marketing.readonly',
    inventory: 'sell.inventory',
    inventoryReadonly: 'sell.inventory.readonly',
    account: 'sell.account',
    accountReadonly: 'sell.account.readonly',
    fulfillment: 'sell.fulfillment',
    fulfillmentReadonly: 'sell.fulfillment.readonly',
    analyticsReadonly: 'sell.analytics.readonly',
    finances: 'sell.finances',
    payment: 'sell.payment.dispute'
  },
  commerce: {
    identityReadonly: 'commerce.identity.readonly'
  }
};

function createEbayApi({
                         refreshToken,
                         clientId,
                         clientSecret,
                         scopes,
                         authHeaderPrefix = 'Bearer'
                       }) {

  const axios = Axios.create({})

  const hash = crypto.createHash('sha256')
    .update(refreshToken)
    .update(clientId)
    .update(clientSecret)
    .update(JSON.stringify(scopes || []))
    .digest('hex');

  const cacheFileName = `/data/${hash}-ebay-auth-token.json`;

  const getCachedToken = () => {
    try {
      if (fs.existsSync(cacheFileName)) {
        const file = fs.readFileSync(cacheFileName, 'utf8');
        const data = JSON.parse(file);
        if (!data.access_token || !data.expires_in || !data.created_at) {
          throw new Error('Invalid file format.');
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

  const getAuthToken = async () => {
    const cachedToken = getCachedToken();
    if (cachedToken) {
      return cachedToken;
    }
    try {
      const {data} = await Axios.post('https://api.ebay.com/identity/v1/oauth2/token', Object.entries({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        ...(scopes && {scope: encodeURI(scopes.join(' '))})
      }).map(([key, value]) => `${key}=${value}`).join('&'), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        }
      })

      fs.writeFileSync(cacheFileName, JSON.stringify({
        ...data,
        created_at: Math.floor(Date.now() / 1000)
      }))
      return data.access_token;
    } catch (e) {
      throw new Error(`Error while fetching eBay oauth token - ${e.message}`);
    }
  }
  axios.interceptors.request.use(async config => {
    const token = await getAuthToken();
    config.headers.Authorization = `${authHeaderPrefix} ${token}`;
    return config;
  })

  return axios;
}

class EbayAPI {

  constructor({
                refreshToken,
                clientId,
                clientSecret,
                scopes = [
                  "https://api.ebay.com/oauth/api_scope",
                  "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
                  "https://api.ebay.com/oauth/api_scope/sell.marketing",
                  "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
                  "https://api.ebay.com/oauth/api_scope/sell.inventory",
                  "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
                  "https://api.ebay.com/oauth/api_scope/sell.account",
                  "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
                  "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
                  "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
                  "https://api.ebay.com/oauth/api_scope/sell.finances",
                  "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
                  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly"
                ]
              } = {}) {
    if (!refreshToken) {
      throw new Error(`refreshToken is required!`);
    }

    if (!clientId) {
      throw new Error(`clientId is required!`);
    }

    if (!clientSecret) {
      throw new Error(`clientSecret is required!`);
    }

    if (!scopes) {
      throw new Error(`scopes are required!`);
    }

    const api = createEbayApi({
      refreshToken,
      clientId,
      clientSecret,
      scopes,
    })

    this.taxonomy = new Taxonomy(api);
    this.sell = new Sell(api);
    this.postOrder = new PostOrder(createEbayApi({
      refreshToken,
      clientId,
      clientSecret,
      authHeaderPrefix: 'IAF',
    }));
  }
}


module.exports = EbayAPI;
