import {PublicClient, WebsocketClient} from 'gdax';
import {TimeRange} from '../enums';
import {CryptoProduct} from "../models";

class Engine {
    public cryptoPublicClient: PublicClient;
    public cryptoWsClient: WebsocketClient;
    public cryptoProducts: Array<CryptoProduct>;

    constructor() {
        this.cryptoPublicClient = new PublicClient();

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
            this.cryptoProducts = await this.cryptoPublicClient.getProducts();
            // For now, filter out non-USD products
            //products = products

            console.info(JSON.stringify(this.cryptoProducts, null, 2));
        } catch (error) {
            console.error(error);
        }

        // Register wsClient events
        this.cryptoWsClient.on('message', this.handleWsMessage);
        this.cryptoWsClient.on('error', this.handleWsError);
        this.cryptoWsClient.on('close', this.handleWsClose);
    }

    /**
     * Gets product(s) history. Only triggered once on start.
     * @param {TimeRange} range
     * @param {Array<Product>} products
     * @returns {any} History records ready for analysis
     */
    getHistory(range: TimeRange, products: Array<CryptoProduct>): any {

    }

    /**
     * Connects to GDAX feeds and spins off the analysis
     * @param {Array<Product>} products
     */
    connectToFeeds(products: Array<CryptoProduct>) {

    }

    /**
     * Based on a new feed, analyse the action to take, if any.
     * @param feed
     */
    handleWsMessage(feed: any) {
        console.log(JSON.stringify(feed, null, 2))
    }

    handleWsError(error: any) {
        console.error(error);
    }

    handleWsClose() {

    }
}

export default Engine;