class Rule {
  /**
   * Entity symbol
   * @example 'BTC-USD'
   */
  symbol;

  /**
   * Percentage of the portfolio allocated to this symbol
   * @example 100
   */
  portfolioDiversity;

  /**
   * Percentage of the invested funds(how much I'm willing to loose after this rule gets applied)
   * @example
   */
  riskLimit;

  /**
   * Percentage of the invested funds that, if reached, will trigger a SELL
   */
  stopLoss;

  /**
   * Triggered after a stop-loss sell
   */
  limitBuyAfterLoss = {
    /**
     * Whether we are or not watching the symbol to hit the limits
     */
    active: true,
    /**
     * Entity value or amount (not percentage) that drives the 'buyLimit'
     */
    dipLimit: '',
    /**
     * Entity value or amount (not percentage) that triggers a BUY after hitting the 'dipLimit
     */
    buyLimit: '',
  };
}

module.exports = Rule;