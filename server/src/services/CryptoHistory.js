const moment = require('moment');

/**
 * Supported models:
 *
 *      From history:
 *      [
 *          [ time,         low,    high,   open,   close,  volume ],
 *          [ 1415398768,   0.32,   4.2,    0.35,   4.2,    12.3 ],
 *          ...
 *      ]
 *
 *      From WS feeds:
 *      {
 *          type: 'ticker',
 *          sequence: 2229280535,
 *          product_id: 'ETH-USD',
 *          price: '1107.99000000',
 *          open_24h: '1040.00000000',
 *          volume_24h: '109412.89518493',
 *          low_24h: '1107.99000000',
 *          high_24h: '1112.11000000',
 *          volume_30d: '7598232.67824779',
 *          best_bid: '1107.99',
 *          best_ask: '1108',
 *          side: 'sell',
 *          time: '2018-01-27T20:28:57.841000Z',
 *          trade_id: 27333419,
 *          last_size: '7.59537847'
 *      }
 *
 */
class CryptoHistory {
    constructor() {
        this._store = {};
    }

    /**
     * Transforms a single record into supported format
     * @param product
     * @param record
     * @private
     */
    static _transform(product, record) {
        return {
            time: record.time || null,
            sequence: record.sequence || null,
            product_id: product,
            price: record.price || record.close || null,
            open: record.open_24h || record.open || null,
            volume: record.volume_24h || record.volume || null,
            low: record.low_24h || record.low || null,
            high: record.high_24h || record.high || null,
            best_bid: record.best_bid || null,
            best_ask: record.best_ask || null,
            side: record.side || null,
            trade_id: record.trade_id || null,
            last_size: record.last_size || null
        };
    }

    /**
     * Transforms a list of records into supported records
     * @private
     * @param product
     * @param records
     */
    _transformAll(product, records = []) {
        if (product && !this._store[product]) {
            this._store[product] = [];
        }
        records.forEach(record => {
            // Place each record in the correct order(by time)
            if (this._store[product].length === 0) {
                this._store[product].push(this._transform(record));
            } else if (moment.unix(record.time).isBefore(this._store[product][0])) {
                this._store[product].unshift(this._transform(record));
            } else {
                // Insert and maintain the order
                for (let i = 0; i < this._store[product].length; i++) {
                    if (moment.unix(record.time).isAfter(moment.unix(this._store[product][i].time))) {
                        this._store[product].splice(i + 1, 0, this._transform(record));
                        break;
                    }
                }
            }
        });
    }

    /**
     * Method used to join records from the history API into the history data structure
     * @param product
     * @param records
     */
    join(product, records = []) {
        this._transformAll(product, records)
            .forEach(record => this.append(record));
    }

    /**
     * Appends a record to the specific product in the data store
     * @param record
     */
    append(record = {}) {
        if (record.product_id) {
            if (!this._store[record.product_id]) {
                this._store[record.product_id] = [];
            }
            this._store[record.product_id].push(record);
        }
    }
}

module.exports = CryptoHistory;