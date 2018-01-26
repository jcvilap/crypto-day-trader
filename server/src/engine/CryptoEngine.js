const {PublicClient, WebsocketClient} = require('gdax');
const {CryptoProduct} = require( '../models');

class Engine {
    constructor() {
        this.publicClient = new PublicClient();
        this.wsClient = new WebsocketClient();
        this.products = null;

        this.handleWsMessage = this.handleWsMessage.bind(this);
        this.handleWsMessage = this.handleWsError.bind(this);
        this.handleWsMessage = this.handleWsClose.bind(this);
    }

    /**
     * Starts the engine. This happens only once at startup
     * @returns {Promise<void>}
     */
    async start() {
        try {
            // Get a list of available USD based products for trading
            this.products = await this.publicClient.getProducts();
            // For now, filter out non-USD products
            //products = products

            console.info(JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error(error);
        }

        // Register wsClient events
        this.wsClient.on('message', this.handleWsMessage);
        this.wsClient.on('error', this.handleWsError);
        this.wsClient.on('close', this.handleWsClose);
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