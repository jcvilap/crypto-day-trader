const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {GDAX_API_URL, GDAX_API_WS_FEED, GDAX_CREDENTIALS} = require('../env');
const Rule = require('../models/Rule');
const {ChannelType} = require('../enums');

class Engine {
  constructor() {
    this.client = null;
    this.wsClient = null;
    this.products = null;
    this.accounts = null;
    this.productIds = null;
    this.rules = null;

    this.handleWsOpen = this.handleWsOpen.bind(this);
    this.handleWsMessage = this.handleWsMessage.bind(this);
    this.handleWsError = this.handleWsError.bind(this);
    this.handleWsClose = this.handleWsClose.bind(this);
    this.start = this.start.bind(this);
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
      // Get stored rules
      this.rules = await Rule.find();
      // Clean all orders on start, new orders will be placed after analysis
      await this.client.cancelAllOrders();
      // Start websocket client
      this.wsClient = this.createWSClient();
      // Register events
      this.registerWsEvents();
      // Fire up the engine
      this.analyse();
    } catch (error) {
      // For now just log the error. In the future we may want to try again reconnecting in 5 seconds or so
      console.error(error);
    }
  }

  /**
   * 1 - Get rules and for each rule
   * 2 - Calculate rule fields such as status and balances based on accounts balances
   * 3 - Save rule to db
   * 4 - Sync with feeds
   * 5 - Place limit orders
   * 6 - Listen to order fills
   * 7 - go to #2
   */
  async analyse() {
    // Create a default rule if no rules found
    if (!this.rules.length) {
      const rule = new Rule({symbol: 'ETH'});
      this.rules = [await rule.save()];
    }

    this.rules.forEach(async rule => {
      const usdAccount = this.accounts.find(({currency}) => currency === 'USD');
      const ruleAccount = this.accounts.find(({currency}) => currency === rule.symbol);
      const usdBalance = Number(usdAccount.balance);
      const ruleBalance = Number(ruleAccount.balance);


      // Only perform an action if there are funds
      if (usdBalance || ruleBalance) {
        const options = {product_id: `${rule.symbol}-USD`, type: 'limit'};

        // Set status and balance. Buy or sell the ${size} @ the ${price}
        if (ruleBalance) {
          rule.status = 'bought';
          rule.balance = ruleBalance;
          rule = await rule.save();
          options.side = 'sell';
          options.price = rule.stopPriceValue.toString();
          options.size = ruleBalance.toString();
        } else if (usdBalance) {
          rule.status = 'sold';
          rule.balance = usdBalance * rule.portfolioDiversity / 100;
          rule = await rule.save();
          options.side = 'buy';
          options.price = rule.limitPriceValue.toString();
          // Get price of latest ticker
          const tick = await this.client.getProductTicker(options.product_id);
          options.size = (rule.balance / tick.price).toString();
        }
        // Place limit orders
        const resp = await this.client.placeOrder(options);
        console.log(resp);
      }
    });
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
      console.log(feed);
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