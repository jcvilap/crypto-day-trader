const _ = require('lodash');
const uuid = require('uuid/v1');
const rh = require('../services/rbhApiService');
const mailer = require('../services/mailService');
const Utils = require('../utils');

const TOKEN_REFRESH_INTERVAL = 18000000; // 5h
const REFRESH_INTERVAL = 10000; // 1s

// Saved in memory for now, will be fetched from DB soon
const rule = {
  currency_code: 'BTC',
  portfolioDiversity: 1,
  sellStrategyPerc: 1,
};

class Engine {
  constructor() {
    this.currencyPair = null;
    this.limitBuyPrice = null;
    this.limitSellPrice = null;
  }

  async start() {
    try {
      await rh.auth();
      this.currencyPair = await rh.getCurrencyPairs(rule.currency_code);
      this.processFeeds();

      // Refresh token and process feeds every 5 hours and 10 secs respectively
      setInterval(() => rh.auth(), TOKEN_REFRESH_INTERVAL);
      setInterval(async () => this.processFeeds(), REFRESH_INTERVAL);
    } catch (error) {
      console.error(error);
    }
  }

  async processFeeds() {
    try {
      const [account, cryptoAccount, holdings, updatedCurrencyPair, orders, historicals, quote] = await Promise.all([
        rh.getAccount(),
        rh.getCryptoAccount(),
        rh.getHoldings(),
        rh.getCurrencyPairs(rule.currency_code),
        rh.getOrders(),
        rh.getHistoricals(this.currencyPair.id),
        rh.getQuote(this.currencyPair.id)
      ]);
      this.currencyPair = updatedCurrencyPair;
      const holding = holdings.find(({ currency }) => currency.code === rule.currency_code);
      const usdBalanceAvailable = Number(account.sma);
      const investedCurrencyBalance = Number(_.get(holding, 'quantity', 0));
      const currentPrice = Number(quote.mark_price || 0);
      const lastOrder = orders.length && orders[0];
      const account_id = _.get(lastOrder || holding, 'account_id');
      const RSI = Utils.calculateRSI(historicals);

      // Purchase Pattern
      if (usdBalanceAvailable && !investedCurrencyBalance) {
        // Price not longer oversold
        if (RSI > 30) {
          this.limitBuyPrice = null;
          // Cancel order and exit
          return await this.cancelLastOrder(lastOrder);
        }
        // If limit not set, set it and exit until next tick
        if (!this.limitBuyPrice) {
          this.limitBuyPrice = currentPrice;
          return;
        }
        // Price went down and RSI is below 30
        if (this.limitBuyPrice > currentPrice) {
          // Update limit
          this.limitBuyPrice = currentPrice;
          // Cancel last order, exit and wait
          return await this.cancelLastOrder(lastOrder);
        }
        // If current price went above the limit price, this means the ticker
        // could be trying to go out of oversold, therefore buy here.
        if (this.limitBuyPrice < currentPrice) {
          // Cancel possible pending order
          await this.cancelLastOrder(lastOrder);
          // Buy 0.02% higher price than market price to get an easier fill
          const price = (currentPrice * 1.0002).toFixed(2).toString();
          const quantity = Utils.calculateCurrencyAmount(price, account.sma, rule.portfolioDiversity);
          return await this.placeOrder(account_id, quantity, price, this.currencyPair.id, 'buy');
        }
      }
      // Sell pattern
      else if (investedCurrencyBalance) {
        const purchasePrice = Number(lastOrder.quantity);
        const overbought = RSI >= 70;
        // If limit not set, put a stop loss at -.5% of the original purchase price
        if (!this.limitSellPrice) {
          this.limitSellPrice = this.getLimitSellPrice(purchasePrice, { initial: true });
          return;
        }
        // Cancel a possible pending order
        await this.cancelLastOrder(lastOrder);
        // If stop loss hit, sell immediate
        if (currentPrice <= this.limitSellPrice) {
          // Sell 0.02% lower price than market price to get an easier fill
          const price = (currentPrice * 0.9998).toFixed(2).toString();
          return await this.placeOrder(account_id, investedCurrencyBalance, price, this.currencyPair.id, 'sell');
        }
        // Increase limit sell price as the current price increases, do not move it if price decreases
        const newLimit = this.getLimitSellPrice(currentPrice, { overbought });
        if (newLimit > this.limitSellPrice) {
          this.limitSellPrice = newLimit;
        }
      }
    } catch (error) {
      console.debug({ error }, 'Error occurred during processFeeds execution');
    }
  }

  /**
   * Helper function to cancel last order if it exists
   * @param order
   * @returns {Promise.<*>}
   */
  cancelLastOrder(order) {
    if (_.get(order, 'cancel_url')) {
      console.debug(Utils.formatJSON(order, 0), 'Canceling order');
      mailer.send({ text: `Canceling Order: ${Utils.formatJSON(order)}`})
      return rh.postWithAuth(order.cancel_url);
    }
    return Promise.resolve();
  }

  /**
   * Helper function to place an order
   * @param account_id
   * @param quantity
   * @param price
   * @param currency_pair_id
   * @param side
   * @returns {*}
   */
  placeOrder(account_id, quantity, price, currency_pair_id, side) {
    const order = {
      account_id,
      quantity,
      price,
      currency_pair_id,
      side,
      time_in_force: 'gtc',
      type: 'limit',
      ref_id: uuid()
    };
    console.debug(Utils.formatJSON(order, 0), 'Placing order');
    mailer.send({ text: `Placed Order: ${Utils.formatJSON(order)}`});
    return rh.placeOrder(order);
  }

  /**
   * Calculates stop loss price based on rule config.
   * Note: On initialization and oversold indicator the stop loss percentage from the rule is
   * divided by two in order to minimize risk and maximize profits respectively
   * @param price
   * @param options
   * @returns {number}
   */
  getLimitSellPrice(price, options = {}) {
    const { initial, overbought } = options;
    const percentage = (initial || overbought) ? rule.sellStrategyPerc / 2 : rule.sellStrategyPerc;
    return price - (price * (percentage / 100));
  }
}

module.exports = Engine;