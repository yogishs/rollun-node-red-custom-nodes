const {stringifyQuery} = require('./ebay-query-utils');

class PostOrder {
  constructor(api) {
    this.api = api;
    this.API_HOSTS = {
      API: 'https://api.ebay.com/post-order/v2/return'
    }
  }

  /**
   *
   * @param returnId
   * @return {*}
   * @doc https://developer.ebay.com/Devzone/post-order/post-order_v2_return-returnid__get.html
   */

  getReturn(returnId) {
    return this.api.get(`${this.API_HOSTS.API}/${returnId}`, {
      params: {
        fieldgroups: 'FULL'
      }
    })
  }

  /**
   *
   * @param limit
   * @param offset
   * @param creation_date_range_from
   * @param creation_date_range_to
   * @param item_id
   * @param order_id
   * @param return_id
   * @param transaction_id
   * @return {*}
   * @doc https://developer.ebay.com/Devzone/post-order/post-order_v2_return_search__get.html
   */

  getReturns({
               limit = 20,
               offset = 0,
               creation_date_range_from,
               creation_date_range_to,
               item_id,
               order_id,
               return_id,
               transaction_id,
             }) {
    return this.api.get(`${this.API_HOSTS.API}/search?${stringifyQuery({
      creation_date_range_from,
      creation_date_range_to,
      item_id,
      order_id,
      return_id,
      transaction_id,
      offset,
      limit,
    })}`)
  }
}

module.exports = PostOrder;
