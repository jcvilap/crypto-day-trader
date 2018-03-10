/**
 * Supported model:
 *      From GDAX WS feeds:
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
 */
class FeedsService {
  init(ids) {
    this._store = new Map(ids.map(id => [id, []]));
  }

  /**
   * Getter by id
   * @param id
   * @returns {*}
   */
  getById(id) {
    return this._store.get(id);
  }

  /**
   * Appends a record to the specific product in the data store. It does not respect order,
   * will push it to the end of the collection
   * @param record
   */
  append(record = {}) {
    if (record.product_id) {
      const collection = this._store.get(record.product_id);
      this._store.set(record.product_id, [...collection, record]);
    }
  }
}

module.exports = new FeedsService();