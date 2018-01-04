const {createServer} = require('http');
const {port} = require('./config');
const Engine = require('./engine/Engine');

class Server {
    constructor() {
        this.server = createServer();
        this.engine = new Engine();

        this.handleExit = this.handleExit.bind(this);

        this.registerEvents();
        this.start();
    }

    registerEvents() {
        process.on('SIGTERM', this.handleExit);
    }

    start() {
        this.server.listen(port, () => {
            //Start engine
            this.engine.start();
            // Log port
            console.info('listening on', port);
        })
    }

    handleExit() {
        this.server.close(() => {
            this.engine.stop();
            process.exit(0)
        });
    }
}

module.exports = new Server();