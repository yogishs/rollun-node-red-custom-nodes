class Taxonomy {
  constructor(api) {
    this.api = api;
    this.API_HOSTS = {
      API: 'https://api.ebay.com'
    }
  }

  /**
   *
   * @param query {string}
   */

  getCategorySuggestions(query) {
    return this.api.get(this.API_HOSTS.API +
      '/commerce/taxonomy/v1_beta/category_tree/0/get_category_suggestions?' +
      `q=${encodeURI(query)}`
    )
  }
}

module.exports = Taxonomy;
