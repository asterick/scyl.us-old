import Inferno from 'inferno';
import { attach, test, start, initialize } from "./system";

import * as runtime from "./system";

import UI  from  "./ui/index.jsx";

attach("system");
test();

initialize().then(() => {
	Inferno.render(<UI />, document.getElementById("container"));
	// start();
});
