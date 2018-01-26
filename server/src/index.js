const {createServer} = require('http');
const {PORT} = require('./config');
const CryptoEngine = require('./engine/CryptoEngine');

class App {
    constructor() {
        this.server = createServer();
        this.cryptoEngine = new CryptoEngine();

        this.handleExit = this.handleExit.bind(this);
        this.registerEvents();
        this.start();
    }

    registerEvents() {
        process.on('SIGTERM', this.handleExit);
    }

    /**
     * After successfully listening on port, start the engine
     */
    start() {
        this.server.listen(PORT, () => {
            // Start engine
            this.cryptoEngine.start().then(() => console.info('Engine started on port', PORT));
        })
    }

    handleExit() {
        this.server.close(() => process.exit(0));
    }
}

module.exports = new App();