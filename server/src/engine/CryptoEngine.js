const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {GDAX_API_URL, GDAX_API_WS_FEED, GDAX_CREDENTIALS} = require('../credentials');

class Engine {
    constructor() {
        this.client = null;
        this.wsClient = null;
        this.products = null;

        this.handleWsMessage = this.handleWsMessage.bind(this);
        this.handleWsError = this.handleWsError.bind(this);
        this.handleWsClose = this.handleWsClose.bind(this);
    }

    /**
     * Starts the engine. This happens only once at startup
     * @returns {Promise<void>}
     */
    async start() {
        try {
            // Create HTTP client
            this.client = this.createClient();
            // Get a list of available USD based products for trading
            this.products = await this.client.getProducts();
            // For now, filter out non-USD products
            this.products = this.products.filter(({id}) => id.includes('USD'));
            // Start websocket client
            this.wsClient = this.createWSClient();
            // Register wsClient events
            this.wsClient.on('message', this.handleWsMessage);
            this.wsClient.on('error', this.handleWsError);
            this.wsClient.on('close', this.handleWsClose);
        } catch (error) {
            // For now just log the error. In the future we may want to try again in 5 seconds or so
            console.error(error);
        }
    }

    /**
     * Creates the public client based on the env variable
     * @returns {"gdax".AuthenticatedClient}
     */
    createClient() {
        const {key, secret, passphrase} = GDAX_CREDENTIALS || {key: '', secret: '', passphrase: ''};
        return new AuthenticatedClient(key, secret, passphrase, GDAX_API_URL);
    }

    /**
     * Creates the WS Client based on the env variable
     * @returns {"gdax".WebsocketClient}
     */
    createWSClient() {
        const products = this.products.map(({id}) => id);
        const options = {channels: ['user']};
        return new WebsocketClient(products, GDAX_API_WS_FEED, GDAX_CREDENTIALS, options);
    }

    /**
     * Gets product(s) history. Only triggered once on start.
     * @param {TimeRange} range
     * @param {Array<CryptoProduct>} products
     * @returns {any} History records ready for analysis
     */
    getHistory(range, products) {

    }

    /**
     * Connects to GDAX feeds and spins off the analysis
     * @param {Array<CryptoProduct>} products
     */
    connectToFeeds(products) {

    }

    /**
     * Based on a new feed, analyse the action to take, if any.
     * @param feed
     */
    handleWsMessage(feed) {
        console.log(JSON.stringify(feed, null, 2))
    }

    handleWsError(error) {
        console.error(error);
    }

    handleWsClose(error) {
        console.error(error);
    }
}

module.exports = Engine;