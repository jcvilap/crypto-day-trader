const mongoose = require('mongoose');
const Utils = require('../utils');

const Rule = new mongoose.Schema({
  /**
   * Base currency symbol.
   * @example 'BTC-USD'
   */
  symbol: String,
  /**
   * Price per bitcoin
   */
  unitPrice: Number,
  /**
   * Funds allocated to the rule.
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
  limitPriceAfterDipPerc: {type: Number, default: .5},
  limitPriceAfterDipValue: Number,
  /**
   * Percentage of the balance (non-invested) that, if reached, will set the  a BUY.
   * Only triggers a BUY if status is 'sold'
   * @example 1%
   */
  limitDipPerc: {type: Number, default: .5},
  limitDipValue: Number,
  /**
   * Flag indicating if the market value hit the dipLimit and enables a market buy using
   * limitPriceValue as limit price
   */
  limitDipActive: {type: Boolean, default: false},
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
  rule.stopPriceValue = rule.unitPrice - (rule.unitPrice * rule.stopPricePerc / 100);
  rule.limitDipValue = rule.unitPrice + (rule.unitPrice * rule.limitDipPerc / 100);
  rule.limitPriceAfterDipValue = rule.limitDipValue  + (rule.limitDipValue  * rule.limitPriceAfterDipPerc / 100);

  // Round values
  rule.riskLimitValue = Utils.precisionRound(rule.riskLimitValue, 2);
  rule.stopPriceValue = Utils.precisionRound(rule.stopPriceValue, 2);
  rule.limitPriceValue = Utils.precisionRound(rule.limitPriceValue, 2);
  rule.limitPriceAfterDipValue = Utils.precisionRound(rule.limitPriceValue, 2);

  next();
});

module.exports = mongoose.model('Rule', Rule);