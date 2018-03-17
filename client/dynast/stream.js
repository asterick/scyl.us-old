if (!TextDecoder || !TextEncoder) {
	var { TextDecoder, TextEncoder } = require("text-encoding");
}

const utf8decode = new TextDecoder('utf-8');
const utf8encode = new TextEncoder('utf-8');

class ReadStream {
	constructor (buffer) {
		this._dv = new DataView(buffer);
		this._buffer = buffer;
		this._index = 0;
	}

	eof() {
		return this._index >= this._buffer.byteLength;
	}

	remaining() {
		return this._buffer.byteLength - this._index;
	}

	uint8() {
		return this._dv.getUint8(this._index++, true);
	}

	uint16() {
		var value = this._dv.getUint16(this._index, true);
		this._index += 2;
		return value;
	}

	uint32() {
		var value = this._dv.getUint32(this._index, true);
		this._index += 4;
		return value;
	}

	float32() {
		var value = this._dv.getFloat32(this._index, true);
		this._index += 4;
		return value;
	}

	float64() {
		var value = this._dv.getFloat64(this._index, true);
		this._index += 8;
		return value;
	}

	buffer(length) {
		if (length === undefined) {
			length = this._buffer.byteLength - this._index;
		}

		return this._buffer.slice(this._index, this._index += length);
	}

	string() {
		return utf8decode.decode(this.buffer(this.varuint()));
	}

	varuint() {
		var value = 0;
		var bits = 0;
		var byte;

		do {
			byte = this.uint8();
			value += (byte & 0x7F) * Math.pow(2, bits);
			bits += 7;
		} while (byte & 0x80);

		return value;
	}

	varint() {
		var value = 0;
		var bits = 0;
		var byte;

		do {
			byte = this.uint8();
			value += (byte & 0x7F) * Math.pow(2, bits);
			bits += 7;
		} while (byte & 0x80);

		if (byte & 0x40) {
			value = value - Math.pow(2, bits);
		}

		return value;
	}
}

class WriteStream {
	constructor() {
		this._bytes = [];

		const _array = new ArrayBuffer(8);

		this._int8 = new Uint8Array(_array);
		this._float32 = new Float32Array(_array);
		this._float64 = new Float32Array(_array);
		this._int32 = new Uint32Array(_array);
	}

	result() {
		return new Uint8Array(this._bytes).buffer;
	}

	uint8(value) {
		this._bytes.push(value);
	}

	uint16(value) {
		this._int32[0] = value;
		this._bytes.push(this._int8[0], this._int8[1]);
	}

	uint32(value) {
		this._int32[0] = value;
		this._bytes.push(this._int8[0], this._int8[1], this._int8[2], this._int8[3]);
	}

	float32(value) {
		this._float32[0] = value;
		this._bytes.push(this._int8[0], this._int8[1], this._int8[2], this._int8[3]);
	}

	float64(value) {
		this._float64[0] = value;
		this._bytes.push(
			this._int8[0], this._int8[1], this._int8[2], this._int8[3],
			this._int8[4], this._int8[5], this._int8[6], this._int8[7]
		);
	}

	buffer(buffer) {
		new Uint8Array(buffer).forEach((byte) => {
			this._bytes.push(byte);
		});
	}

	string(string) {
		this.varuint(string.length);
		this.buffer(utf8encode.encode(string));
	}

	varuint(value) {
		var bytes = [];

		do {
			var byte = value % 0x80;
			value = (value - byte) / 0x80;
			this._bytes.push(value ? (byte | 0x80) : byte);
		} while (value > 0);
	}

	varint(value) {
		var neg = value < 0;

		// Get the complement and use that
		if (neg) value = -1 - value;

		do {
			var more = value >= 0x40;
			var byte = value % 0x80;
			value = (value - byte) / 0x80;

			this._bytes.push((byte ^ (neg ? 0x7F : 0)) | (more ? 0x80 : 0));
		} while (more);
	}
}

module.exports = {
	ReadStream,
	WriteStream
}
