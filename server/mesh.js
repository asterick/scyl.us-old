const WebRTC = require('wrtc');

// Poly-fill the WebRTC connections for our proxy
global.RTCPeerConnection = WebRTC.RTCPeerConnection;
global.RTCSessionDescription = WebRTC.RTCSessionDescription;
global.RTCIceCandidate = WebRTC.RTCIceCandidate;

module.exports = (app) => {
	require('express-ws')(app);

	app.ws('/intake', function(ws, req) {
	  	ws.close();
	});
}
