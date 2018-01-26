/**
 * This class represents the core model of this app. It could be interpreted as a Crypto-currency of a Stock
 * depending on the market
 */
class CryptoProduct {
    id;                     // "LTC-USD"
    base_currency;          // "LTC"
    quote_currency;         // "USD"
    base_min_size;          // "0.1"
    base_max_size;          // "4000"
    quote_increment;        // "0.01"
    display_name;           // "LTC/USD"
    status;                 // "online"
    margin_enabled;         // false
    status_message;         // null
    min_market_funds;       // "10"
    max_market_funds;       // "1000000"
    post_only;              // false
    limit_only;             // false
    cancel_only;            // false
}

export default CryptoProduct;