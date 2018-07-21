var socket = null;

export function connect(token_id) {
	const [ _, secure, host ] = /^http(s?):\/\/(.*)$/.exec(document.location.origin);
	const path = `ws${secure}://${host}/auth?token=gg${token_id}`;

	var exampleSocket = new WebSocket(path, "protocolOne");

	exampleSocket.onopen = function (event) {
	  exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
	};
}

export function disconnect() {
	socket.close();
	socket = null;
}