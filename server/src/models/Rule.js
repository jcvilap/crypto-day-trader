class Rule {
  constructor(symbol, status, portfolioDiversity, riskLimit, stopPrice, limitPrice) {
    this.symbol = symbol;
    this.status = status;
    this.portfolioDiversity = portfolioDiversity;
    this.riskLimit = riskLimit;
    this.stopPrice = stopPrice;
    this.limitPrice = limitPrice;
  }
  /**
   * Base currency symbol.
   * @example 'BTC'
   */
  symbol;

  /**
   * Equivalent amount in USD of the funds allocated to the rule.
   * Calculated on initial rule load
   * @readonly
   */
  balance;

  /**
   * Current status of the rule. Possible values:
   *  idle - the Rule is turned off by user
   *  bought - result of a BUY
   *  sold - result of a SELL
   *  pending - pending BUY or SELL transaction
   */
  status;

  /**
   * Percentage that 'balance' represents of the entire account portfolio.
   * @example 100%
   */
  portfolioDiversity;

  /**
   * Percentage of balance representing how much I'm willing to loose.
   * This amount will increase/decrease as the balance fluctuates
   */
  riskLimit;

  /**
   * Percentage of the balance (invested) that, if reached, will trigger a SELL.
   * Only triggers a SELL if status is 'bought'
   * @example 1%
   */
  stopPrice;

  /**
   * Percentage of the balance (non-invested) that, if reached, will trigger a BUY.
   * Only triggers a BUY if status is 'sold'
   * @example 1%
   */
  limitPrice;
}

module.exports = Rule;