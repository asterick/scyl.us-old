import Inferno from 'inferno';
import System from "./system";

fetch("system0.rom").then((data) => {
	var runtime = new System(data.arrayBuffer());

	function rerender() {
	    const UI = require("./ui/index.jsx").default;
		Inferno.render(<UI runtime={runtime}/>, document.getElementById("container"));
	}

	rerender();

	if (module && module.hot) {
	  module.hot.accept("./ui/index.jsx", rerender);
	}
});
