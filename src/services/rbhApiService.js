const request = require('request-promise-native');
const { RBH_API_BASE, NUMMUS_RH_API_BASE, RH_CREDENTIALS } = require('../../config/env');
const common = { json: true };
const TOKEN_REFRESH_INTERVAL = 18000000;

class RHService {
  constructor() {
    this.commonPrivate = { ...common, headers: {} };
  }

  auth() {
    const options = {
      ...common,
      method: 'POST',
      uri: `${RBH_API_BASE}/oauth2/token/`,
      form: {
        ...RH_CREDENTIALS,
        grant_type: 'password',
        scope: 'internal',
        client_id: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS', // not sure if needed
        expires_in: TOKEN_REFRESH_INTERVAL // 5h
      }
    };
    return request(options)
      .then(({ access_token, token_type }) => this.commonPrivate.headers.Authorization = `${token_type} ${access_token}`);
  }

  /**
   * Even though it seems like RH supports multiple accounts for a user, for now we will not...
   */
  getAccount() {
    return this.getWithAuth( `${RBH_API_BASE}/accounts/`)
      .then(({ results }) => results[0]);
  }

  /**
   * Even though it seems like RH supports multiple accounts for a user, for now we will not...
   */
  getCryptoAccount() {
    return this.getWithAuth( `${NUMMUS_RH_API_BASE}/accounts/`)
      .then(({ results }) => results[0]);
  }

  /**
   * Only available for crypto
   * @returns {Promise.<TResult>|Promise}
   */
  getHoldings() {
    return this.getWithAuth( `${NUMMUS_RH_API_BASE}/holdings/`)
      .then(({ results = [] }) => results.filter(({ quantity }) => Number(quantity)));
  }

  /**
   * Get crypto orders
   * @returns {*}
   */
  getOrders() {
    return this.getWithAuth(`${NUMMUS_RH_API_BASE}/orders/`)
      .then(({ results = [] }) => results);
  }

  placeOrder(order) {
    return this.postWithAuth(`${NUMMUS_RH_API_BASE}/orders/`, order);
  }

  /**
   * Gets the first currency which its asset currency is 'symbol'
   * @param symbol
   * @returns {Promise.<TResult>|Promise}
   */
  getCurrencyPairs(symbol) {
    return this.getWithAuth(`${NUMMUS_RH_API_BASE}/currency_pairs/?symbol=${symbol}`)
      .then(({ results = [] }) =>
        symbol ? results.find(({ asset_currency }) => asset_currency.code === symbol) : results);
  }

  /**
   * Get historical values for passed currency pair id
   * @param pairId Currency pair id
   * @returns {Promise.<TResult>|Promise}
   */
  getHistoricals(pairId) {
    return this.getWithAuth(`${RBH_API_BASE}/marketdata/forex/historicals/${pairId}/?span=hour&interval=15second&bounds=24_7`)
      .then(({ data_points = [] }) => data_points);
  }

  /**
   * Get quote. Used for interval feed analysis
   * @param id
   * @returns {Promise|Promise.<TResult>}
   */
  getQuote(id) {
    return this.getWithAuth(`${RBH_API_BASE}/marketdata/forex/quotes/${id}/`);
  }

  /**
   * Generic GET request with authentication headers
   * @param uri
   * @returns {*}
   */
  getWithAuth(uri) {
    const options = {
      ...this.commonPrivate,
      uri,
    };
    return request(options);
  }

  /**
   * Generic POST request with authentication headers
   * @param uri
   * @param body
   * @param customOption
   * @returns {*}
   */
  postWithAuth(uri, body, customOption = {}) {
    const options = {
      ...this.commonPrivate,
      method: 'POST',
      uri,
      body,
      ...customOption,
    };
    return request(options);
  }
}

module.exports = new RHService();