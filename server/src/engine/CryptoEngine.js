const {AuthenticatedClient, WebsocketClient} = require('gdax');
const {GDAX_API_URL, GDAX_API_WS_FEED, GDAX_CREDENTIALS} = require('../credentials');
const {ChannelType, Granularity} = require('../enums');
const CryptoHistory = require('./CryptoHistory');
const moment = require('moment');

class Engine {
    constructor() {
        this.client = null;
        this.wsClient = null;
        this.products = null;
        this.history = new CryptoHistory();

        this.handleWsOpen = this.handleWsOpen.bind(this);
        this.handleWsMessage = this.handleWsMessage.bind(this);
        this.handleWsError = this.handleWsError.bind(this);
        this.handleWsClose = this.handleWsClose.bind(this);
        this.startAnalysis = this.startAnalysis.bind(this);
        this.buildLiveHistory = this.buildLiveHistory.bind(this);
    }

    /**
     * Starts the engine. This happens only once at startup
     */
    async start() {
        try {
            // Create HTTP client
            this.client = this.createClient();
            // Get a list of available USD based products for trading
            this.products = await this.client.getProducts();
            // For now, filter out non-USD products. This will change...
            this.products = this.products.filter(({id}) => id.includes('USD'));
            // Start websocket client
            this.wsClient = this.createWSClient();
            // Register events
            this.registerWsEvents();
            // Get historic values and start initial analysis
            this.getHistory(Granularity.SIX_HOURS, this.startAnalysis);
            // Get last date history and prepare history stream for real-time decision making
            this.getHistory(Granularity.ONE_MINUTE, this.buildLiveHistory);
        } catch (error) {
            // For now just log the error. In the future we may want to try again reconnecting in 5 seconds or so
            console.error(error);
        }
    }

    registerWsEvents() {
        this.wsClient.on('open', this.handleWsOpen);
        this.wsClient.on('message', this.handleWsMessage);
        this.wsClient.on('error', this.handleWsError);
        this.wsClient.on('close', this.handleWsClose);
    }

    /**
     * After initial history is finished downloading, start analysis to make initial decision
     * @param history
     */
    startAnalysis(history) {
        // todo
    }

    /**
     * Take last day history and append to the ticker values so far
     * @param history Most granular hisrtory returned by GDAX API
     */
    buildLiveHistory(history) {
        this.history.join(history);
    }

    /**
     * Handle new feeds
     * @param feed
     */
    handleWsMessage(feed) {
        // For now only listen to the ticker channel
        if (feed.type === ChannelType.TICKER) {
            this.history.append(feed);
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
        const options = {channels: ['ticker']};
        return new WebsocketClient(products, GDAX_API_WS_FEED, GDAX_CREDENTIALS, options);
    }

    /**
     * Gets product(s) history. GDAX public APIs only supports 3 requests per second by IP, therefore we need to
     * divide the requests into buckets and execute them sequentially
     * @param granularity
     * @param callback
     */
    getHistory(granularity, callback) {
        let [buckets, history, counter, interval] = [[], [], 0, null];

        // Place products into buckets of 3
        this.products.forEach(({id}) => {
            if (!buckets[counter]) {
                buckets[counter] = [id];
            } else if (buckets[counter] && buckets[counter].length && buckets[counter].length < 3) {
                buckets[counter].push(id);
            } else {
                counter++;
                buckets[counter] = [id];
            }
        });

        // Reset counter for reuse
        counter = 0;

        // Set a 1 second interval every 1 bucket(3 requests)
        interval = setInterval(async () => {
            if (counter < buckets.length) {
                history.push(...await Promise.all(buckets[counter].map(id =>
                    this.client.getProductHistoricRates(id, {granularity})
                )));
                counter++;
            } else {
                callback(history);
                clearInterval(interval);
            }
        }, 1000);
    }

    /**
     * WS Open callback
     */
    handleWsOpen() {
        console.info('Websocket client open');
    }

    /**
     * Handle app errors
     * @param error
     */
    handleWsError(error) {
        console.error(error);
    }

    /**
     * Handle WS closing. Tries reconnecting unless forced to close
     * @param force
     */
    handleWsClose(force) {
        if (!force) {
            // Reconnect
            this.wsClient = this.createWSClient();
            // Hook events
            this.registerWsEvents();
        }
    }
}

module.exports = Engine;