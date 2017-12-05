const EventEmitter = require('events').EventEmitter;

class PeerConnection extends EventEmitter {
	constructor() {
		this.connection = new RTCPeerConnection();
		this.connection.ondatachannel = event => this._bindChannel(event.channel);
		this.connection.onicecandidate = event => this._onicecandidate(event);
	}

	offer() {
		this._bindChannel(this.connection.createDataChannel("sendChannel"));

		this.channel.onopen =
		this.channel.onclose = event => this._onstate(event);
		this.channel.onmessage = event => this._ondata(event);

		this.connection.createOffer()
			.then(offer => {
				console.log(offer);
				this.connection.setLocalDescription(offer)
			})
			.catch((err) => this._onerror(err))
	}

	answer(offer) {
		this.connection.createAnswer()
		    .then(answer => {
		    	this.connection.setLocalDescription(answer)
				this.connection.setRemoteDescription(offer)
		    })
			.catch((err) => this._onerror(err))
	}

	close() {
		this.channel.close();
		this.connection.close();
	}

	_addIce(candidate) {
		this.connection
			.addIceCandidate(candidate)
			.catch(err => this._onerror(err));
	}

	_bindChannel(channel) {
		this.channel = channel;
		this.channel.onopen =
		this.channel.onclose = event => this._onstate(event);
		this.channel.onmessage = event => this._ondata(event);
	}

	_onicecandidate(event) {
		console.log(event);
	}

	_onstate(event) {
		var state = sendChannel.readyState;
		console.log("state:", state)
	}

	_ondata(event) {
		console.log("data:", event.data);
	}

	_onerror(err) {
		console.error(error);
	}
}

/*
const remote = new PeerConnection();
const local = new PeerConnection();

remote.offer();

function startup() {
	localConnection.onicecandidate = e => {
		if (!e.candidate) return ;
	    console.log(e.candidate);

	};

	remoteConnection.onicecandidate = e => {
		if (!e.candidate) return ;
	    localConnection.addIceCandidate(e.candidate.toJSON()).catch(handleAddCandidateError)
	};

	localConnection.createOffer()
	    .then(offer => {
	    	console.log(offer);
	    	localConnection.setLocalDescription(offer)
	    	//return remoteConnection.setRemoteDescription(offer)
	    })
	    .then(() => console.log("!!!"))
	    .then(() => remoteConnection.createAnswer())
	    .then(answer => {
	    	remoteConnection.setLocalDescription(answer)
	    	return localConnection.setRemoteDescription(answer);
	    })
	    .catch(handleCreateDescriptionError);
}
*/
