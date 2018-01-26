/**
 * Order related enums
 */
const OrderStatus =  {FILLED: 'FILLED', PENDING: 'PENDING', REJECTED: 'REJECTED', CANCELLED: 'CANCELLED'};
const OrderType = {BUY: 'BUY', SELL: 'SELL'};
const TimeRange = {HOUR: 'HOUR', DAY: 'DAY', WEEK: 'WEEK', MONTH: 'MONTH', YEAR: 'YEAR'};

export {OrderType, OrderStatus, TimeRange}