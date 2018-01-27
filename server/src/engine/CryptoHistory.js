/*
    Supported models:

    From history:
    [
        [ time,         low,    high,   open,   close,  volume ],
        [ 1415398768,   0.32,   4.2,    0.35,   4.2,    12.3 ],
        ...
    ]

    From feed:
    {
        type: 'ticker',
        sequence: 2229280535,
        product_id: 'ETH-USD',
        price: '1107.99000000',
        open_24h: '1040.00000000',
        volume_24h: '109412.89518493',
        low_24h: '1107.99000000',
        high_24h: '1112.11000000',
        volume_30d: '7598232.67824779',
        best_bid: '1107.99',
        best_ask: '1108',
        side: 'sell',
        time: '2018-01-27T20:28:57.841000Z',
        trade_id: 27333419,
        last_size: '7.59537847'
    }

 */
class CryptoHistory {
    constructor() {
        this._store = {};
    }

    /**
     * Transforms a list of records into supported records
     * @param product
     * @param records
     */
    transformAll(product, records = []) {
        // todo
    }

    /**
     * Method used to join records from the history API into the history data structure
     * @param product
     * @param records
     */
    join(product, records = []) {
        this.transformAll(product, records)
            .forEach(record => this.append(record));
    }

    /**
     * Appends a record to the specific product in the data store
     * @param record
     */
    append(record = {}) {
        if (record.product_id) {
            if(!this._store[record.product_id]){
                this._store[record.product_id] = [];
            }
            this._store[record.product_id].push(record);
        }
    }
}

module.exports = CryptoHistory;