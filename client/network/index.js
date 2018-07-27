var socket = null;

export function connect(token_id) {
	const protocol = document.location.protocol.replace("http","ws");
	const path = `${protocol}//${document.location.host}/auth?token=${token_id}`;

	socket = new WebSocket(path, "cedar-bus");

	socket.onopen = function (event) {
	  socket.send("Here's some text that the server is urgently awaiting!")
	};

	socket.onclose = function () {
		console.log("Socket closed");
		socket = null;
	}
}

export function disconnect() {
	if (socket !== null) socket.close();
	socket = null;
}
