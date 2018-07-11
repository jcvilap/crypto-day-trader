const moment = require('moment');

class Utils {
  static precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  /**
   * RSI(14) over one minute
   * Assumes passed data represents 1hr overall over 15 secs interval
   * @param historicals
   * @returns {number}
   */
  static calculateRSI(historicals = []) {
    const data_points = [];
    let avgGain = 0;
    let aveLoss = 0;
    let bucketMinute = null;

    // Get last 15 mins worth of data
    for (let i = historicals.length - 1; i > (historicals.length - 1) - (15 * 4); i--) {
      const minute = moment(historicals[i].begins_at).minute();
      if (bucketMinute !== minute) {
        data_points.push(historicals[i].close_price);
        bucketMinute = minute;
      }
    }
    // Calculate averages
    for (let i = 0; i < 14; i++) {
      const ch = data_points[i] - data_points[i + 1];
      if (ch >= 0) {
        avgGain += ch;
      } else {
        aveLoss -= ch;
      }
    }
    avgGain /= 14;
    aveLoss /= 14;
    // Calculate RS
    const RS = avgGain / aveLoss;
    // Return RSI
    return 100 - (100 / (1 + RS));
  }

  static calculateCurrencyAmount(quotePrice, balance, percentage) {
    const _quotePrice = Number(quotePrice);
    const _balance = Number(balance);
    const _percentage = Number(percentage);
    const amountToInvest = _balance * (_percentage / 100);
    const result = amountToInvest / _quotePrice;
    return result.toString();
  }
}

module.exports = Utils;