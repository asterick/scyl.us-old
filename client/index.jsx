import { render } from 'inferno';
import UI  from  "./ui/index.jsx";

import { attach, start, initialize } from "./system";

initialize().then(() => {
	attach("system");
	//start();

	render(<UI />, document.getElementById("container"));
});
