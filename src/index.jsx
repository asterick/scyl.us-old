import Inferno from 'inferno';
import System from "./system";

import { load } from "./util";

var runtime = null;

function rerender() {
    const UI = require("./ui/index.jsx").default;
	Inferno.render(<UI runtime={runtime}/>, document.body);
}

load("system0.rom").then((data) => {
	runtime = new System(data);

	window.addEventListener("resize", () => {
		runtime.resize()
	});

	rerender();

	if (module && module.hot) {
	  module.hot.accept("./ui/index.jsx", rerender);
	}
});
