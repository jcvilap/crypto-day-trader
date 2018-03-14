const mongoose = require('mongoose');
const Utils = require('../utils');

const Rule = new mongoose.Schema({
  /**
   * Product id
   * @example 'BTC-USD'
   */
  product_id: String,
  /**
   * Price per bitcoin in USD
   */
  price: Number,
  /**
   * Amount of bitcoin bought or sold
   * @readonly
   */
  size: {type: Number, default: 0},
  /**
   * Current status of the rule. Possible values:
   *  idle - the Rule is turned off by user
   *  bought - result of a BUY
   *  sold - result of a SELL
   *  pending - pending BUY or SELL transaction
   */
  status: {type: String, default: 'idle'},
  /**
   * Percentage that this rule represents of the entire account funds
   * @example 100%
   */
  portfolioDiversity: {type: Number, default: 100},
  /**
   * Highest value the rule had held since it was bought. This will drive the stop loss price
   */
  high: {type: Number, default: 0},
  /**
   * Price per bitcoin that, if reached, will trigger a limit SELL
   * Only triggers a SELL if status is 'bought'
   * @example 1%
   */
  stopLossPerc: {type: Number, default: .1},
  stopLossPrice: Number,
  /**
   * Lowest value the rule had held since it was sold. This will drive the limit sell price
   */
  low: {type: Number, default: 0},
  /**
   * Price per bitcoin that, if reached, will trigger a limit BUY
   * Only triggers a BUY if status is 'sold'
   * @example 1%
   */
  limitPerc: {type: Number, default: .05},
  limitPrice: Number,
  /**
   * Price per bitcoin that, if reached, will trigger a market SELL and will put the rule on 'idle' state
   * TODO: handle risk logic
   */
  riskPerc: {type: Number, default: 10},
  riskPrice: Number,
  /**
   * Order id of active BUY or SELL limit order
   */
  limitOrderId: String,
});

/**
 * Calculates all the dynamic fields on the rule
 * @param rule
 */
const validateRule = (rule) => {
  // Upwards movement
  if (rule.status === 'bought' && (rule.high < rule.price || rule.high === 0)) {
    rule.high = rule.price;
    rule.riskPrice = rule.high - (rule.high * rule.riskPerc / 100);
    rule.stopLossPrice = rule.high - (rule.high * rule.stopLossPerc / 100);
    rule.riskPrice = Utils.precisionRound(rule.riskPrice, 2);
    rule.stopLossPrice = Utils.precisionRound(rule.stopLossPrice, 2);
  }

  // Downwards movement
  if (rule.status === 'sold' && (rule.low > rule.price || rule.low === 0)) {
    rule.low = rule.price;
    rule.limitPrice = rule.low + (rule.low * rule.limitPerc / 100);
    rule.limitPrice = Utils.precisionRound(rule.limitPrice, 2);
  }
};

/**
 * Before persisting a rule, update docinfo
 */
Rule.pre('save', function preSave(next) {
  const rule = this;
  const now = new Date().toISOString();

  // Update doc info
  rule.set('docinfo.updatedAt', now);
  if (!rule.get('docinfo.createdAt')) {
    rule.set('docinfo.createdAt', now);
  }

  // Calculate fields
  validateRule(rule);

  next();
});

module.exports = {
  Rule: mongoose.model('Rule', Rule),
  validateRule
};