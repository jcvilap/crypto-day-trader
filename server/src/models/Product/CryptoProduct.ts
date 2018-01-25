/**
 * This class represents the core model of this app. It could be interpreted as a Crypto-currency of a Stock
 * depending on the market
 */
class CryptoProduct {
    public id: string;                      // "LTC-USD"
    public base_currency: string;           // "LTC"
    public quote_currency: string;          // "USD"
    public base_min_size: string;           // "0.1"
    public base_max_size: string;           // "4000"
    public quote_increment: string;         // "0.01"
    public display_name: string;            // "LTC/USD"
    public status: string;                  // "online"
    public margin_enabled: boolean;         // false
    public status_message: string;          // null
    public min_market_funds: string;        // "10"
    public max_market_funds: string;        // "1000000"
    public post_only: boolean;              // false
    public limit_only: boolean;             // false
    public cancel_only: boolean;            // false
}

export default CryptoProduct;