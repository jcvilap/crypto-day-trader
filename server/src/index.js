"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var config_1 = require("./config");
var Engine_1 = require("./engine/Engine");
var Server = (function () {
    function Server() {
        this.server = http_1.createServer();
        this.engine = new Engine_1.default();
        this.handleExit = this.handleExit.bind(this);
        this.registerEvents();
        this.start();
    }
    Server.prototype.registerEvents = function () {
        process.on('SIGTERM', this.handleExit);
    };
    /**
     * After successfully listening to a port, start the engine
     */
    Server.prototype.start = function () {
        var _this = this;
        this.server.listen(config_1.PORT, function () {
            // Start engine
            _this.engine.start();
            // Log port
            console.info('listening on', config_1.PORT);
        });
    };
    Server.prototype.handleExit = function () {
        this.server.close(function () { return process.exit(0); });
    };
    return Server;
}());
exports.default = new Server();
