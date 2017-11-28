const express = require("express");
const WebSocket = require('ws');

const logging = require("./logging");

const Config = require("../config.json");

// Poly-fill in WebRTC
const WebRTC = require('wrtc');

global.RTCPeerConnection = WebRTC.RTCPeerConnection;
global.RTCSessionDescription = WebRTC.RTCSessionDescription;
global.RTCIceCandidate = WebRTC.RTCIceCandidate;

// === Main ===
const app = express();
const expressWs = require('express-ws')(app);

if (Config.environment === 'development') {
    const webpack = require("webpack");
    const compiler = webpack(require("../webpack.config.js"));

    compiler.watch({}, (err, stats) => {
        if (err) {
            logging("error", err);
        }
    });

	app.use(express.static('assets'));
}

app.ws('/socketserver', function(ws, req) {
  ws.close();
});

app.listen(Config.server.port, () => {
    logging("debug", `Server started on port ${Config.server.port}`);
});
