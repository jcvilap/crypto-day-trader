const CryptoOrder = require('./CryptoOrder');

class CryptoStopOrder extends CryptoOrder {
  stopProduct;
  stopPrice;
}

module.exports = CryptoStopOrder;