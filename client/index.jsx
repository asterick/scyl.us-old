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
		
		fetch(`/auth?token=${id_token}`).then(async response => {
			const reader = await response.json();
			console.log(reader)
		});
	});

	attach(document.getElementById("system"));
	render(<UI auth={auth} />, document.getElementById("container"));
	start();
})();
