const express = require("express");

const logging = require("./logging");
const Config = require("../config.json");

const {OAuth2Client} = require('google-auth-library');
const google_client = new OAuth2Client(Config.client_id);

// === Main ===
const app = express();
const expressWs = require('express-ws')(app);

app.engine('html', require('ejs').renderFile);

console.log(app.get('views'));

app.get("/", (req, res) => {
	res.render('index.html', {
		client_id: Config.oauth.client_id
	});
});

app.ws('/auth', async (ws, req) => {
    try {
        const ticket = await google_client.verifyIdToken({
            "idToken": String(req.query.token),
            "audience": Config.client_id
        });
    
        const payload = ticket.getPayload();
        const user_id = payload.sub;

        logging('info', `Socket connection by: ${user_id}`);
    } catch(e) {
        console.log(e);
        ws.close();
        return ;
    }

    ws.on('message', (data) => {
        console.log(data);
    });

    switch (ws.protocol) {
        case 'cedar-bus':
            // TODO
            break ;
        default:
            ws.close();
            return ;
    }
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

app.listen(Config.server.port, () => {
    logging("debug", `Server started on port ${Config.server.port}`);
});
