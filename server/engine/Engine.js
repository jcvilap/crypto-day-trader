const WebSocket = require('ws');
const millisecondsInAnHour = 360000000000;

class Engine {
    constructor() {
        this.interval = null;
        this.websocketClient = new WebSocket(`ws://${host}:${port}`);
        this.websocketClient.on('message', this.handleWebSocketMessage);
        this.analyze = this.analyze.bind(this);
    }

    start() {
        //this.interval = setInterval(this.analyze, millisecondsInAnHour);
        this.analyze();
    }

    stop() {
        clearInterval(this.interval);
    }

    /**
     * todo: Use https://iextrading.com/developer/docs
     */
    analyze() {
    }
}

module.exports = Engine;