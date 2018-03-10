const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {GDAX_API_URL, GDAX_API_WS_FEED, GDAX_CREDENTIALS} = require('../../credentials');
const {ChannelType} = require('../../enums');
const RuleEngine = require('./RuleEngine');

class Engine {
  constructor() {
    this.client = null;
    this.wsClient = null;
    this.products = null;
    this.accounts = null;
    this.productIds = null;
    this.ruleEngine = null;

    this.handleWsOpen = this.handleWsOpen.bind(this);
    this.handleWsMessage = this.handleWsMessage.bind(this);
    this.handleWsError = this.handleWsError.bind(this);
    this.handleWsClose = this.handleWsClose.bind(this);
  }

  /**
   * Starts the engine. This happens only once at startup
   */
  async start() {
    try {
      // Create HTTP client
      this.client = this.createClient();
      // Get list of accounts with balances
      this.accounts = await this.client.getAccounts();
      // Get a list of available USD based products for trading
      this.products = await this.client.getProducts();
      // For now, filter out non-USD products. This will change, especially when trying to minimize tax deductions...
      this.products = this.products.filter(({quote_currency: s}) => s === 'USD');
      // Helper list of product ids
      this.productIds = this.products.map(({id}) => id);
      // Fetch the list of rules for the current user
      this.ruleEngine = new RuleEngine(this.products, this.accounts);
      // Start websocket client
      this.wsClient = this.createWSClient();
      // Register events
      this.registerWsEvents();
    } catch (error) {
      // For now just log the error. In the future we may want to try again reconnecting in 5 seconds or so
      console.error(error);
    }
  }

  /**
   * Register Websocket events handlers
   */
  registerWsEvents() {
    this.wsClient.on('open', this.handleWsOpen);
    this.wsClient.on('message', this.handleWsMessage);
    this.wsClient.on('error', this.handleWsError);
    this.wsClient.on('close', this.handleWsClose);
  }

  /**
   * Handle new feeds
   * @param feed
   */
  handleWsMessage(feed) {
    // For now only listen to the ticker channel
    if (feed.type === ChannelType.TICKER) {
      this.ruleEngine.handleNewFeed(feed);
    }
  }

  /**
   * Creates the public client based on the env variable
   * @returns {"gdax".AuthenticatedClient}
   */
  createClient() {
    const {key, secret, passphrase} = GDAX_CREDENTIALS || {key: '', secret: '', passphrase: ''};
    return new AuthenticatedClient(key, secret, passphrase, GDAX_API_URL);
  }

  /**
   * Creates the WS Client based on the env variable
   * @returns {"gdax".WebsocketClient}
   */
  createWSClient() {
    const products = this.productIds;
    const options = {channels: ['ticker']};
    return new WebsocketClient(products, GDAX_API_WS_FEED, GDAX_CREDENTIALS, options);
  }

  /**
   * WS Open callback
   */
  handleWsOpen() {
    console.info('Websocket client open');
  }

  /**
   * Handle app errors
   * @param error
   */
  handleWsError(error) {
    console.error(error);
  }

  /**
   * Handle WS closing. Tries reconnecting unless forced to close
   * @param force
   */
  handleWsClose(force) {
    if (!force) {
      // Reconnect
      this.wsClient = this.createWSClient();
      // Hook events
      this.registerWsEvents();
    }
  }
}

module.exports = Engine;