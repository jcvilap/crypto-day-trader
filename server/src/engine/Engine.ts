import {PublicClient} from 'gdax';
import {TimeRange} from '../enums';
import Product from "../models/Product";

class Engine {
    public publicClient: PublicClient;

    constructor() {
        this.publicClient = new PublicClient();
    }

    /**
     * Starts the engine. This happens only once at startup
     * @returns {Promise<void>}
     */
    async start() {
        try {
            /**
             * Get a list of available currency pairs for trading
             */
            const products = await this.publicClient.getProducts();
            console.info(JSON.stringify(products, null, 2));
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Gets product(s) history. Only triggered once on start.
     * @param {TimeRange} range
     * @param {Array<Product>} products
     * @returns {any} History records ready for analysis
     */
    getHistory(range: TimeRange, products: Array<Product>): any {

    }

    /**
     * Connects to GDAX feeds and spins off the analysis
     * @param {Array<Product>} products
     */
    connectToFeeds(products: Array<Product>) {

    }

    /**
     * Based on a new feed, analyse the action to take, if any.
     * @param feed
     */
    handleNewFeed(feed: any) {

    }
}

export default Engine;