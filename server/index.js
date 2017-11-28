const { URL } = require("url");

const express = require("express");
const WebSocket = require('ws');

const logging = require("./logging");

const Config = require("../config.json");

// === Main ===
const server = express();
const base = new URL(Config.server);

if (Config.environment === 'development') {
    const webpack = require("webpack");
    const compiler = webpack(require("../webpack.config.js"));

    compiler.watch({}, (err, stats) => {
        if (err) {
            logging("error", err);
        }
    });

	server.use(express.static('assets'));
}

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
    console.log(ws);

    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

server.listen(base.port, () => {
    logging("debug", `Server started on port ${base.port}`);
});
