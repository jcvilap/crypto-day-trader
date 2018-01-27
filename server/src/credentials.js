/**
 * Change this key to move from SANDBOX(test env) to LIVE(production)
 * @type {string}
 */
const ENV_KEY = 'LIVE';
const ENV = {
    SANDBOX: {
        GDAX_API_URL: 'https://api-public.sandbox.gdax.com',
        GDAX_API_WS_FEED: 'wss://ws-feed-public.sandbox.gdax.com',
        GDAX_CREDENTIALS: null
    },
    LIVE: {
        GDAX_API_URL: 'https://api.gdax.com',
        GDAX_API_WS_FEED: 'wss://ws-feed.gdax.com',
        GDAX_CREDENTIALS: {
            key: '27eec1262177c472c92cc406923cbc88',
            secret: '+feHzSdGpDFGyB7wCZJmT8vQ4XlKgKT9Zap6NuNL34Fy5f6dIbNwLmmDCFxBsQJsEGinIZemDC31waB8pv2vYw==',
            passphrase: '540801'
        }
    }
};

module.exports = ENV[ENV_KEY];