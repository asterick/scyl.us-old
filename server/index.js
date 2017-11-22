const Config = require("../config.json");

const { URL } = require("url");

const express = require("express");

const logging = require("./logging");

// === Main ===
const app = express();
const base = new URL(Config.server);

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

app.listen(base.port, () => {
    logging("debug", `Server started on port ${base.port}`);
});
