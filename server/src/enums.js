"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Order related enums
 */
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["FILLED"] = 0] = "FILLED";
    OrderStatus[OrderStatus["PENDING"] = 1] = "PENDING";
    OrderStatus[OrderStatus["REJECTED"] = 2] = "REJECTED";
    OrderStatus[OrderStatus["CANCELLED"] = 3] = "CANCELLED";
})(OrderStatus || (OrderStatus = {}));
exports.OrderStatus = OrderStatus;
var OrderType;
(function (OrderType) {
    OrderType[OrderType["BUY"] = 0] = "BUY";
    OrderType[OrderType["SELL"] = 1] = "SELL";
    OrderType[OrderType["LIMIT_BUY"] = 2] = "LIMIT_BUY";
    OrderType[OrderType["LIMIT_SELL"] = 3] = "LIMIT_SELL";
})(OrderType || (OrderType = {}));
exports.OrderType = OrderType;
