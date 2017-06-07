import Inferno from 'inferno';
import System from "./system";

fetch("system0.rom").then((data) => {
	data.arrayBuffer().then((bios) => {
		var runtime = new System(bios);

		window.addEventListener("resize", (e) => runtime.resize(e));

		function rerender() {
		    const UI = require("./ui/index.jsx").default;
			Inferno.render(<UI runtime={runtime}/>, document.getElementById("container"));
		}

		rerender();

		if (module && module.hot) {
		  module.hot.accept("./ui/index.jsx", rerender);
		}
	});
});
