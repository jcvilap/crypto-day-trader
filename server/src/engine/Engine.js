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
    this.processFeed = this.processFeed.bind(this);
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
      console.log(JSON.stringify(await this.client.getOrders()));
      // Clean all orders on start, new orders will be placed after analysis
      await this.client.cancelAllOrders();
      // Start websocket client
      this.wsClient = this.createWSClient();
      // Initially sync rules and listen to ws channel
      this.sync()
    } catch (error) {
      // For now just log the error. In the future we may want to try again reconnecting in 5 seconds or so
      console.error(error);
    }
  }

  /**
   * On app load, there are no orders pending and we need to sync the existing rules with the market
   * values and issue limit orders before moving on to live analysis...
   *  1 - Get rules and for each rule
   *  2 - Calculate rule fields such as status and balances based on accounts balances
   *  3 - Save rule to db
   *  5 - Place initial stop loss order(s) if possible
   *  6 - Listen to order fills
   */
  async sync() {
    try {
      // Create a default rule if no rules found
      if (!this.rules.length) {
        const rule = new Rule({symbol: 'BTC-USD'});
        this.rules = [await rule.save()];
      }

      this.rules.forEach(async rule => {
        const usdAccount = this.accounts.find(({currency}) => currency === 'USD');
        const ruleAccount = this.accounts.find(({currency}) => currency === rule.symbol.replace('-USD', ''));
        const usdBalance = Number(usdAccount.balance);
        const ruleBalance = Number(ruleAccount.balance);

        // Only perform an action if there are funds
        if (usdBalance || ruleBalance) {
          const options = {product_id: rule.symbol, type: 'limit'};
          const {price: lastPrice} = await this.client.getProductTicker(options.product_id);

          // If we already have bitcoin, we only want to put a simple stop loss
          if (ruleBalance) {
            // Update and save rule
            rule.status = 'bought';
            rule.balance = ruleBalance;
            rule.unitPrice = lastPrice;
            rule = await rule.save();
            // Prepare stop loss order
            options.side = 'sell';
            options.stop = 'loss';
            options.stop_price = rule.stopPriceValue.toString();
            options.price = rule.stopPriceValue.toString();
            options.size = ruleBalance.toString();
            // Place stop loss
            await this.client.placeOrder(options);
          }
          // Here we only need to update the rule, the 'analyse' function will send the limit order
          // once the rule limit (limitDipValue) triggers
          else if (usdBalance) {
            // Update and save rule
            rule.status = 'sold';
            rule.balance = usdBalance * rule.portfolioDiversity / 100;
            rule.unitPrice = lastPrice;
            rule = await rule.save();
          }
        }
      });

      // At this point, rules were updated and stop losses placed, now we need to listen to the user and ticker
      // to check for price changes and my orders possibly becoming fills
      this.registerWsEvents();
    } catch (e) {
      throw new Error(e.message);
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
  async processFeed(feed) {
    console.log(JSON.stringify(feed));
    if (feed.product_id && [ChannelType.TICKER, ChannelType.USER].includes(feed.type)) {
      this.rules = await Rule.find();
      const rule = this.rules.find(({symbol}) => feed.product_id);
      console.log(JSON.stringify(rule));
    }
  }

  /**
   * Register Websocket events handlers
   */
  registerWsEvents() {
    this.wsClient.on('open', this.handleWsOpen);
    this.wsClient.on('message', this.processFeed);
    this.wsClient.on('error', this.handleWsError);
    this.wsClient.on('close', this.handleWsClose);
  }

  /**
   * Handle new feeds
   * @param feed
   */
  handleWsMessage(feed) {
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
    const options = {channels: ['ticker', 'user']};
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