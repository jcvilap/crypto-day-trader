const {Rule} = require('../../models');

class RuleEngine {
  constructor(products, accounts) {
    this.products = products;
    this.accounts = accounts;
    this.rules = this.fetchRules();

    console.log('products', JSON.stringify(products, null, 2));
    console.log('accounts', JSON.stringify(accounts, null, 2));

    this.sync();
  }

  /**
   * Fetches the rules for the current user in our DB
   * TODO: integrate with the DB
   * @returns {[Rule]}
   */
  fetchRules() {
    return [new Rule('BTC', 'idle', 100, 10, .15, .15)];
  }

  /**
   * After having products, orders, rules and accounts
   */
  sync() {

  }

  handleNewFeed(feed) {
    console.log(feed);
  }
}

module.exports = RuleEngine;