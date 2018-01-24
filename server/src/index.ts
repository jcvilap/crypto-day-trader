import {createServer, HttpServer} from 'http';
import {PORT} from './config';
import Engine from './engine/Engine';

class Server {
    public server: HttpServer = createServer();
    public engine: Engine = new Engine();

    constructor() {
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
            this.engine.start().then(() => console.info('Engine started on port', PORT));
        })
    }

    handleExit() {
        this.server.close(() => process.exit(0));
    }
}

export default new Server();