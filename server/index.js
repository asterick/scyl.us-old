const express = require("express");

const logging = require("./logging");
const Config = require("../config.json");

const {OAuth2Client} = require('google-auth-library');
const google_client = new OAuth2Client(Config.client_id);

// === Main ===
const app = express();

app.engine('html', require('ejs').renderFile);

console.log(app.get('views'));

app.get("/", (req, res) => {
	res.render('index.html', {
		client_id: Config.oauth.client_id
	});
});

app.get('/auth', async (req, res) => {
    const idToken = req.query.token;
    
    const ticket = await google_client.verifyIdToken({
        idToken,
        audience: Config.client_id
    });
    
    const payload = ticket.getPayload();
    const user_id = payload.sub;

    res.json(payload);
});

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

// "asdf{asdf}".replace(/\{(.*?)\}/ig, (_, a) => (console.log(k, a), "!!!"))

app.listen(Config.server.port, () => {
    logging("debug", `Server started on port ${Config.server.port}`);
});
