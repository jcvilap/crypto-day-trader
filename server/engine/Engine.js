
const millisecondsInAnHour = 360000000000;

class Engine {
    constructor() {
        this.interval = null;
        this.analize = this.analize.bind(this);
    }

    start() {
        this.interval = setInterval(this.analize, millisecondsInAnHour)
        this.analize();
    }

    stop() {
        clearInterval(this.interval);
    }

    /**
     * todo: Use https://iextrading.com/developer/docs
     */
    analize() {
    }
}

module.exports = Engine;