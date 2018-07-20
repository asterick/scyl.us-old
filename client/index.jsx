import { render } from 'inferno';
import UI  from  "./ui/index.jsx";

import { attach, start, initialize } from "./system";

(async () => {
	await initialize();
	const gapi = await google;
	const auth = gapi.auth2.getAuthInstance();

	auth.currentUser.listen(async user => {
		if (!user.isSignedIn()) return ;
		
		// This is the only thing we will use, or care about using
		const id_token = user.getAuthResponse().id_token;
		
		debugger ;

		fetch("/auth", {headers: { id_token }})
	});

	attach(document.getElementById("system"));
	render(<UI auth={auth} />, document.getElementById("container"));
	start();
})();
