class Rule {
  /**
   * Entity symbol for this .
   * @example 'BTC-USD'
   */
  symbol;

  /**
   * Equivalent amount in USD of the invested funds.
   * Only holds a value if the state is equals to 'bought'
   */
  balance;

  /**
   * Current state of the rule. Possible values:
   *  idle - the Rule is turned off by user
   *  bought - result of a BUY
   *  sold - result of a SELL
   *  pending - pending BUY or SELL transaction
   */
  state;

  /**
   * Percentage of the entire portfolio allocated to this symbol.
   * @example 100%
   */
  portfolioDiversity;

  /**
   * Percentage of balance representing how much I'm willing to loose.
   * This amount will increase/decrease as the balance fluctuates
   */
  riskLimit;

  /**
   * Percentage of the invested funds that, if reached, will trigger a SELL.
   * Only holds a value if the state is equals to 'bought'
   * @example 1%
   */
  stopLoss;

  /**
   * True if the entity value reaches 'dipLimitValue' amount and the rule state is 'sold'
   * False after a BUY is performed
   */
  dipLimitActive;

  /**
   * If entity value reaches this value, 'dipLimitActive' becomes true and 'buyLimit' triggers a SELL if
   * the entity reaches the amount of 'buyLimitValue'
   * Only holds a value if the state is equals to 'sold'
   */
  dipLimitValue;

  /**
   * Triggers a SELL if the entity reaches this amount after reaching 'dipLimitValue'
   */
  buyLimitValue;
}

module.exports = Rule;