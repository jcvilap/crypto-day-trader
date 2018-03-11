const CryptoOrder = require('./CryptoOrder');

class LimitOrder extends CryptoOrder {
  limitProduct;
  limitPrice;
}

module.exports = LimitOrder;