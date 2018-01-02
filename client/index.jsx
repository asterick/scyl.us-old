import Inferno from 'inferno';
import System from "./system";
import UI  from  "./ui/index.jsx";

var runtime = new System("system");
runtime.gpu.attach("system");
runtime.gpu.test();

runtime.onReady = function () {
	Inferno.render(<UI runtime={runtime}/>, document.getElementById("container"));
	runtime.start();
};
