const {stringifyQuery} = require("./ebay-query-utils");

class Sell {
  constructor(api) {
    this.api = api;
    this.API_HOSTS = {
      APIZ: 'https://apiz.ebay.com/sell',
      API: 'https://api.ebay.com/sell'
    }
  }

  /**
   *
   * @param limit
   * @param offset
   * @param filter - example - {
   *   transactionDate: {
   *     from: '2018-10-23T00:00:01.000Z'
   *     to: '2018-11-09T00:00:01.000Z'    // can be empty
   *   },
   *   transactionStatus: 'PAYOUT', // one of - (PAYOUT, FUNDS_PROCESSING, FUNDS_AVAILABLE_FOR_PAYOUT, FUNDS_ON_HOLD, COMPLETED, FAILED)
   *   orderId: '03-03620-33763',
   *   transactionId: '03-03620-33763'
   * }
   * @param sort
   * @return {*}
   * @doc https://developer.ebay.com/api-docs/sell/finances/resources/transaction/methods/getTransactions
   */

  getTransactions({
                    limit = 20,
                    offset = 0,
                    filter = {}
                  }) {

    return this.api.get(
      this.API_HOSTS.APIZ +
      '/finances/v1/transaction?' + stringifyQuery({
        limit, offset,
        filter
      }))
  }

  /**
   * @doc https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrder
   * @param orderId
   * @return {*}
   */

  getOrder(orderId) {
    return this.api.get(
      this.API_HOSTS.API +
      `/fulfillment/v1/order/${orderId}`
    )
  }

  /**
   * @doc https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
   */

  getOrders({
              orderIds,
              filter = {},
              limit = 20,
              offset = 0
            }) {

    return this.api.get(
      this.API_HOSTS.API +
      `/fulfillment/v1/order?` +
      stringifyQuery({
        orderIds,
        filter,
        limit,
        offset
      })
    )
  }
}

module.exports = Sell;
