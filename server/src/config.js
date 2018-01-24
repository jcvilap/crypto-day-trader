"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PORT = 1111;
exports.PORT = PORT;
var URLS = {
    development: {
        GDAX_REST_API: 'https://api-public.sandbox.gdax.com',
        GDAX_WS_FEED: 'wss://ws-feed-public.sandbox.gdax.com',
        GDAX_FIX_API: 'tcp+ssl://fix-public.sandbox.gdax.com:4198'
    },
    production: {
        GDAX_REST_API: 'https://api.gdax.com',
        GDAX_WS_FEED: 'wss://ws-feed.gdax.com',
        GDAX_FIX_API: 'tcp+ssl://fix.gdax.com:4198'
    }
};
exports.URLS = URLS;
