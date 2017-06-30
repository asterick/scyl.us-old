import Inferno from 'inferno';
import System from "./system";

import Dynast from "./dynast";

fetch("system0.rom")
	.then((data) => data.arrayBuffer())
	.then((bios) => {
		var runtime = new System(bios);

		function rerender() {
		    const UI = require("./ui/index.jsx").default;
			Inferno.render(<UI runtime={runtime}/>, document.getElementById("container"));
		}

		rerender();

		if (module && module.hot) {
		  module.hot.accept("./ui/index.jsx", rerender);
		}

		// We are all setup we can now do shit
		runtime.start();
	});
