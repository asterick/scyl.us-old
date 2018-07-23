import { render } from 'inferno';
import UI from  "./ui/index.jsx";
import * as network from "./network";

import { attach, start, initialize } from "./system";

(async _ => {
	await initialize();
	const auth = await google;

	const status_change = async user => {
		if (!user.isSignedIn()) {
			network.disconnect();
		} else {
			network.connect(user.getAuthResponse().id_token);
		}
	}

	auth.currentUser.listen(status_change);
	status_change(auth.currentUser.get());

	attach(document.getElementById("system"));
	render(<UI auth={auth} />, document.getElementById("container"));
	start();
})();
