import { render } from 'inferno';
import UI  from  "./ui/index.jsx";

import { attach, start, initialize } from "./system";

attach("system");
initialize().then(() => {
	render(<UI />, document.getElementById("container"));
	//start();
});
