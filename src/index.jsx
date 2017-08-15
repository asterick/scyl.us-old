import Inferno from 'inferno';
import System from "./system";

var runtime = new System();

runtime.onReady = function () {
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
};

