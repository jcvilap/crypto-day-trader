const {createServer} = require('http');
const mongoose = require('mongoose');
const {PORT, DB} = require('./env');
const Engine = require('./engine/Engine');

class App {
  constructor() {
    this.server = createServer();
    this.engine = new Engine();
    mongoose.connect(DB);
    this.db = mongoose.connection;

    this.handleExit = this.handleExit.bind(this);
    this.registerEvents();
    this.start();
  }

  registerEvents() {
    process.on('SIGTERM', this.handleExit);
    this.db.on('error', (e) => console.error('connection error:', e));
    this.db.once('open', () => console.log('Database connected'));
  }

  /**
   * After successfully listening on port, start the engine
   */
  start() {
    this.server.listen(PORT, () => {
      console.log('Listening to port:', PORT);
      this.engine.start();
    })
  }

  handleExit() {
    this.server.close(() => process.exit(0));
  }
}

module.exports = new App();