import Inferno from 'inferno';
import System from "./system";

import WASM from "./wasm";

fetch("hello.wasm")
	.then((data) => data.arrayBuffer())
	.then((array) => console.log(JSON.stringify(WASM(array), null, 4)));

/*
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
*/