const Config = require("../config.json");
const winston = require('winston');

Object.keys(Config.logging.transports).forEach((transport) => {
    winston.add(winston.transports[transport], Config.logging.transports[transport]);
});

winston.level = Config.logging.level;

module.exports = winston.log;
