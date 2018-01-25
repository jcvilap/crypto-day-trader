"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Currency = (function () {
    function Currency(code, name) {
        this._code = code;
        this._name = name;
    }
    Object.defineProperty(Currency.prototype, "code", {
        get: function () {
            return this._code;
        },
        set: function (value) {
            this._code = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Currency.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    return Currency;
}());
exports.default = Currency;
