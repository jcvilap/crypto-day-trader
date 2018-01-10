const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

class Engine {
    async start() {
        try {
            /**
             * Get a list of available currency pairs for trading
             */
            const products = await publicClient.getProducts();
            console.info(JSON.stringify(products, null, 2));
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = Engine;