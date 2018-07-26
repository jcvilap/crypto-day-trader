const _ = require('lodash');
const uuid = require('uuid/v1');
const rh = require('../services/rbhApiService');
const Utils = require('../utils');

const TOKEN_REFRESH_INTERVAL = 18000000; // 5h
const REFRESH_INTERVAL = 10000; // 1m
const rule = {
  currency_code: 'BTC',
  portfolioDiversity: 1,
  stopLossPerc: 1,
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

      // Purchase pattern - working
      if (usdBalanceAvailable && !investedCurrencyBalance && Utils.calculateRSI(historicals) <= 30) {
        // If limit price not set or above current price, update it
        if (!this.limitBuyPrice || this.limitBuyPrice > currentPrice) {
          this.limitBuyPrice = currentPrice;
        }
        // If current price went above the limit price it is time to buy
        else if (this.limitBuyPrice <= currentPrice) {
          // Cancel any pending order
          if (lastOrder.cancel_url) {
            // todo: before cancelling check if order is outdated before taking out from the queue
            await rh.postWithAuth(lastOrder.cancel_url);
          }
          // Buy 0.02% higher than market price
          const price = (Number(quote.mark_price) * 0.9998).toFixed(2).toString();
          // Try buying here
          await rh.placeOrder({
            account_id,
            currency_pair_id: this.currencyPair.id,
            price,
            quantity: Utils.calculateCurrencyAmount(price, account.sma, rule.portfolioDiversity),
            side: 'buy',
            time_in_force: 'gtc',
            type: 'limit',
            ref_id: uuid()
          });
        }
      }
      // Sell pattern todo: finish here
      else if (investedCurrencyBalance) {
        // Cancel any pending order
        if (lastOrder.cancel_url) {
          // todo: before cancelling check if order is outdated before taking out from the queue
          await rh.postWithAuth(lastOrder.cancel_url);
        }
        // Stop loss execution, realized gain is less than -1%
        const realizedGainPerc = 100 * (investedCurrencyBalance / Number(lastOrder.quantity));// todo revisit
        if (realizedGainPerc < -1) {
          // Sell immediate
          await rh.placeOrder({
            account_id,
            currency_pair_id: this.currencyPair.id,
            price: quote.mark_price,
            quantity: investedCurrencyBalance,
            side: 'sell',
            time_in_force: 'gtc',
            type: 'limit',
            ref_id: uuid()
          });
        } else if (realizedGainPerc > 1) {
          // todo Set limitSell limit
          // At this point, making over 1%, set/update stop loss
          await rh.placeOrder({
            account_id,
            currency_pair_id: this.currencyPair.id,
            price: quote.mark_price,
            quantity: investedCurrencyBalance,
            side: 'sell',
            time_in_force: 'gtc',
            type: 'limit',
            ref_id: uuid()
          });
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

module.exports = Engine;