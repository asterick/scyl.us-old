import { render } from 'inferno';
import UI from  "./ui/index.jsx";
import * as network from "./network";

import { attach, start, initialize } from "./system";

(async () => {
	await initialize();
	const gapi = await google;
	const auth = gapi.auth2.getAuthInstance();

	auth.currentUser.listen(async user => {
		if (!user.isSignedIn()) {
			network.disconnect();
		} else {
			network.connect(user.getAuthResponse().id_token);
		}
	});

	attach(document.getElementById("system"));
	render(<UI auth={auth} />, document.getElementById("container"));
	start();
})();
