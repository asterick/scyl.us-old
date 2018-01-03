import Inferno from 'inferno';
import UI  from  "./ui/index.jsx";

import { attach, test, start, initialize } from "./system";

attach("system");
test();

initialize().then(() => {
	Inferno.render(<UI />, document.getElementById("container"));
	start();
});
