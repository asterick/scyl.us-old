import Inferno from 'inferno';
import System from "./system";
import UI  from  "./ui/index.jsx";

import PeerConnection from "./rtc";

var runtime = new System("system");

runtime.onReady = function () {
	Inferno.render(<UI runtime={runtime}/>, document.getElementById("container"));
	runtime.start();
};

var url = new URL('/socketserver', window.location.href);
url.protocol = url.protocol.replace("http","ws");
var exampleSocket = new WebSocket(url.href, ["protocolOne"]);

exampleSocket.onopen = function (event) {
  exampleSocket.send("Here's some text that the server is urgently awaiting!");
};

exampleSocket.onmessage = function (event) {
	console.log(event);
}
