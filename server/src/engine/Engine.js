const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {GDAX_API_URL, GDAX_API_WS_FEED, GDAX_CREDENTIALS} = require('../env');
const {Rule, validateRule} = require('../models/Rule');
const {ChannelType} = require('../enums');
const Utils = require('../utils');

class Engine {
  constructor() {
    this.client = null;
    this.wsClient = null;
    this.products = null;
    this.accounts = null;
    this.productIds = null;
    this.rules = null;

    this.handleWsOpen = this.handleWsOpen.bind(this);
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
      // Create HTTP and WS client
      this.client = this.createClient();
      // Store metadata values
      const [accounts, products, rules] = await Promise.all([
        this.client.getAccounts(),        // List of accounts with balances
        this.client.getProducts(),        // List of available USD products
        Rule.find(),                      // Rules stored in the DB
        this.client.cancelAllOrders()     // Cancel past limit orders
      ]);

      this.accounts = accounts;
      // Get a list of available USD based products for trading. For now, filter out non-USD products.
      // This will change, especially when trying to minimize tax deductions...
      this.products = products.filter(({quote_currency: s}) => s === 'USD');
      // Helper list of product ids
      this.productIds = this.products.map(({id}) => id);
      // Get stored rules
      this.rules = rules;

      // Initially sync rules and listen to ws channel
      this.syncRules();
      // Start websocket client and listen to the channel
      this.wsClient = this.createWSClient();

    } catch (error) {
      // For now just log the error. In the future we may want to try again reconnecting in 5 seconds or so
      console.error(error);
    }
  }

  /**
   * On app load, there are no orders pending and we need to sync the existing rules with the market
   * values and issue new limit orders before moving on to live analysis...
   *  1 - Get rules and for each rule
   *  2 - Calculate rule fields such as status and balances based on accounts balances
   *  3 - Save rule to db
   *  5 - Place initial limit order
   *  6 - Listen to order fills
   */
  async syncRules() {
    try {
      // Create a default rule if no rules found
      if (!this.rules.length) {
        const rule = new Rule({product_id: 'BTC-USD'});
        this.rules = [await rule.save()];
      }

      this.rules.forEach(async rule => {
        const usdAccount = this.accounts.find(({currency}) => currency === 'USD');
        const ruleAccount = this.accounts.find(({currency}) => currency === rule.product_id.replace('-USD', ''));
        const usdBalance = Number(usdAccount.balance);
        const ruleBalance = Number(ruleAccount.balance);

        // Only perform an action if there are funds
        if (usdBalance || ruleBalance) {
          const options = {product_id: rule.product_id, type: 'limit'};
          const {price: lastPrice} = await this.client.getProductTicker(options.product_id);

          // Update price
          rule.price = lastPrice;
          // Calculate limits
          validateRule(rule);

          // If we already have bitcoin, we only want to put a simple stop loss
          if (ruleBalance) {
            // Update and save rule
            rule.status = 'bought';
            rule.size = ruleBalance;
            // Prepare stop loss order
            options.side = 'sell';
            options.stop = 'loss';
            options.stop_price = rule.stopLossPrice.toString();
            options.price = rule.stopLossPrice.toString();
            options.size = rule.size.toString();
          }
          // Put a limit buy if we do not have bitcoin
          else if (usdBalance) {
            // Update and save rule
            rule.status = 'sold';
            // Prepare limit buy order
            options.side = 'buy';
            options.stop = 'entry';
            options.size = usdBalance; // won't work because there is a taker fee of .25%, stopping here, bummer....
            options.stop_price = rule.limitPrice.toString();
            options.price = rule.limitPrice.toString();
          }

          // Place order and store order id
          const order = await this.client.placeOrder(options);
          if (order.id) {
            rule.limitOrderId = order.id;
            await rule.save();
          }
        }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   *  Ticker logic:
   * 1 - Get rule
   * 2 - Calculate rule fields such as status and balances based on accounts balances
   * 3 - Save rule to db
   * 4 - Sync with feeds
   * 5 - Place limit orders
   * 6 - Listen to order fills
   * 7 - go to #2
   */
  async processFeed(feed) {
    console.log(JSON.stringify(feed));
    this.rules = await Rule.find();
    const rule = this.rules.find(({product_id}) => feed.product_id);

    if (ChannelType.TICKER === feed.type) {
      // Price increased, update stop loss
      if (rule.status === 'bought') {
        if (rule.price < Number(feed.price)) {
          // Cancel existing stop loss
          if (rule.limitOrderId) {
            await this.client.cancelOrder(rule.limitOrderId);
          }
          // Save new price and recalculate fields
          rule.price = Number(feed.price);
          await rule.save();
          // Send new stop loss
          const order = await this.client.placeOrder({
            side: 'sell', stop: 'loss', type: 'limit',
            stop_price: rule.stopLossPrice.toString(),
            price: rule.stopLossPrice.toString(),
            size: rule.size.toString()
          });
          // Update with new order id
          rule.limitOrderId = order.id;
        } else {
          // Only update price if the price dropped
          rule.price = Number(feed.price);
        }
      } else if (rule.status === 'sold') {
        // Price decreased, update limit buy
        if (rule.price > Number(feed.price)) {
          const usdAccount = this.accounts.find(({currency}) => currency === 'USD');
          const usdBalance = Number(usdAccount.balance);
          // Cancel existing stop loss
          if (rule.limitOrderId) {
            await this.client.cancelOrder(rule.limitOrderId);
          }
          // Save new price and recalculate fields
          rule.price = Number(feed.price);
          await rule.save();
          // Send new stop loss
          const order = await this.client.placeOrder({
            side: 'buy', type: 'limit',
            size: Utils.precisionRound(usdBalance / rule.limitPrice, 8).toString(),
            price: rule.limitPrice.toString()
          });
          // Update with new order id
          rule.limitOrderId = order.id;
        } else {
          // Only update price if the price increased
          rule.price = Number(feed.price);
        }
      }
      // Update rule as a last step
      await rule.save();
    } else if (ChannelType.HEARTBEAT !== feed.type) {
      console.log(JSON.stringify(feed));
      // TODO: listen in the user channel for fills and build logic
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