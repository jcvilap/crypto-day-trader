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
   * Todo: normalize better all the datatypes
   * @param product
   * @param record
   * @private
   */
  static _transform(product, record = []) {
    return {
      time: record.sequence || record[0] || null,
      product_id: product,
      price: parseFloat(record.price) || record[4]  || null,
      open: parseFloat(record.open_24h) || record[3] || null,
      volume: parseFloat(record.volume_24h) || record[5] || null,
      low: parseFloat(record.low_24h) || record[1] || null,
      high: parseFloat(record.high_24h) || record[2] || null,
      best_bid: parseFloat(record.best_bid) || null,
      best_ask: parseFloat(record.best_ask) || null,
      side: record.side || null,
      trade_id: record.trade_id || null,
      last_size: record.last_size || null
    };
  }

  /**
   * Transforms a list of records into supported records
   * Todo: finish this method
   * @private
   * @param product
   * @param records
   */
   _transformAll(product, records = []) {
    if (product && !this._store[product]) {
      this._store[product] = [];
    }
    records.forEach(record => {
      const transformedRecord = CryptoHistory._transform(product, record);
      // Place each record in the correct order(by time)
      if (this._store[product].length === 0) {
        this._store[product].push(transformedRecord);
      } else if (moment.unix(transformedRecord.time).isBefore(this._store[product][0].time)) {
        this._store[product].unshift(transformedRecord);
      } else {
        // Insert and maintain the order
        for (let i = 0; i < this._store[product].length; i++) {
          if (moment.unix(transformedRecord.time).isAfter(moment.unix(this._store[product][i].time))) {
            this._store[product].splice(i + 1, 0, transformedRecord);
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
    this._transformAll(product, records);
  }

  /**
   * Appends a record to the specific product in the data store. It does not respect order,
   * will push it to the end of the collection
   * @param record
   */
  append(record = {}) {
    if (record.product_id) {
      if (!this._store[record.product_id]) {
        this._store[record.product_id] = [];
      }
      this._store[record.product_id].push(CryptoHistory._transform(record.product_id, record));
    }
  }
}

module.exports = CryptoHistory;