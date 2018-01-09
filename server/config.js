const port = 1111;
const WS_CB_API_URL = 'https://ws-api.iextrading.com/1.0';
const cb_config = {
    clientId: 'e683e46cd37ec8ad55b3a77e5900e87e3fe7db2fcec6bd4909891e0131f49c3a',
    clientSecret: 'd06da97a778e8cbec66008385e4c30abc5b74cc40a2553d9aff518352bcfef95',
    redirectURIs: ['https://artificialtrader.surge.sh'],
    sampleAuthorizeUrl: 'https://www.coinbase.com/oauth/authorize?client_id=e683e46cd37ec8ad55b3a77e5900e87e3fe7db2fcec6bd4909891e0131f49c3a&redirect_uri=https%3A%2F%2Fartificialtrader.surge.sh&response_type=code&scope=wallet%3Auser%3Aread',
    reuseExistingTokens: 'Enabled',
    notificationURL: 'https://artificialtrader.surge.sh',
    scopeRestrictions: {
        'wallet:transaction:send': 1,
        'wallet:transactions:send:bypass-2fa': false
    }
};
module.exports = {port, WS_API_URL};