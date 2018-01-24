/**
 * Order related enums
 */
enum OrderStatus {FILLED, PENDING, REJECTED, CANCELLED}
enum OrderType {BUY, SELL}
enum TimeRange {HOUR, DAY, WEEK, MONTH, YEAR}

export {OrderType, OrderStatus, TimeRange}