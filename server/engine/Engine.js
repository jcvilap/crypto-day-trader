const WebSocket = require('ws');
const {WS_IEX_API_URL} = require('../config');
const millisecondsInAnHour = 360000000000;

class Engine {
    constructor() {
        this.interval = null;
        this.wsClient = new WebSocket(WS_IEX_API_URL);

        this.analyze = this.analyze.bind(this);
        this.handleWebSocketConnect = this.handleWebSocketConnect.bind(this);
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);

        this.registerEvents();
    }

    registerEvents() {
        this.wsClient.on('connect', this.handleWebSocketConnect);
        this.wsClient.on('message', this.handleWebSocketMessage);
    }

    handleWebSocketConnect() {
        // Subscribe to topics (i.e. appl,fb,aig+)
        this.wsClient.emit('subscribe', 'snap,fb,aig+');
    }

    handleWebSocketMessage(msg) {
        console.log(msg);
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