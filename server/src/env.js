/**
 * Change this key to move from SANDBOX(test env) to LIVE(production)
 * @type {string}
 */
const PORT = 1111;
const ENV_KEY = 'LIVE';
const DB_BASE = 'mongodb://<usernam>:<password>!@ds';
const ENV = {
  SANDBOX: {
    GDAX_API_URL: 'https://api-public.sandbox.gdax.com',
    GDAX_API_WS_FEED: 'wss://ws-feed-public.sandbox.gdax.com',
    GDAX_CREDENTIALS: null,
    DB: `${DB_BASE}<db-url>`
  },
  LIVE: {
    GDAX_API_URL: 'https://api.gdax.com',
    GDAX_API_WS_FEED: 'wss://ws-feed.gdax.com',
    GDAX_CREDENTIALS: {
      key: '<key>',
      secret: '<secret>',
      passphrase: ''
    },
    DB: `${DB_BASE}<db-url>`
  }
};

module.exports = {...ENV[ENV_KEY], PORT};