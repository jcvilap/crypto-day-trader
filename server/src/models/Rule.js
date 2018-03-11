const mongoose = require('mongoose');

const Rule = new mongoose.Schema({
  /**
   * Base currency symbol.
   * @example 'BTC'
   */
  symbol: String,
  /**
   * Equivalent amount in USD of the funds allocated to the rule.
   * Calculated on initial rule load
   * @readonly
   */
  balance: {type: Number, default: 0},
  /**
   * Current status of the rule. Possible values:
   *  idle - the Rule is turned off by user
   *  bought - result of a BUY
   *  sold - result of a SELL
   *  pending - pending BUY or SELL transaction
   */
  status: {type: String, default: 'idle'},
  /**
   * Percentage that 'balance' represents of the entire account portfolio.
   * @example 100%
   */
  portfolioDiversity: {type: Number, default: 100},
  /**
   * Percentage of balance representing how much I'm willing to loose.
   * This amount will increase/decrease as the balance fluctuates
   */
  riskLimitPerc: {type: Number, default: 10},
  riskLimitValue: Number,
  /**
   * Percentage of the balance (invested) that, if reached, will trigger a SELL.
   * Only triggers a SELL if status is 'bought'
   * @example 1%
   */
  stopPricePerc: {type: Number, default: 1},
  stopPriceValue: Number,

  /**
   * Percentage of the balance (non-invested) that, if reached, will trigger a BUY.
   * Only triggers a BUY if status is 'sold'
   * @example 1%
   */
  limitPricePerc: {type: Number, default: .5},
  limitPriceValue: Number,
});

/**
 * Before persisting a rule, update docinfo and calculate values
 */
Rule.pre('save', function preSave(next) {
  const rule = this;
  const now = new Date().toISOString();

  // Update doc info
  rule.set('docinfo.updatedAt', now);
  if (!rule.get('docinfo.createdAt')) {
    rule.set('docinfo.createdAt', now);
  }
  // Calculate values
  rule.riskLimitValue = rule.balance - (rule.balance * rule.riskLimitPerc / 100);
  rule.stopPriceValue = rule.balance - (rule.balance * rule.stopPricePerc / 100);
  rule.limitPriceValue = rule.balance + (rule.balance * rule.limitPricePerc / 100);
  next();
});

module.exports = mongoose.model('Rule', Rule);