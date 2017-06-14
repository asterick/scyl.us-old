const utf8decode = new TextDecoder('utf-8');
const utf8encode = new TextEncoder('utf-8');

// NOTE: THIS DOES NOT SUPPORT VARINT64

export class ReadStream {
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
			byte = this._dv.getUint8(this._index++);
			value |= (byte & 0x7F) << bits;
			bits += 7;
		} while (byte & 0x80);

		return value >>> 0;
	}

	varint() {
		var value = 0;
		var bits = 0;
		var byte;

		do {
			byte = this._dv.getUint8(this._index++);
			value |= (byte & 0x7F) << bits;
			bits += 7;
		} while (byte & 0x80);

		if (byte & 0x40) {
			value |= ~((1 << bits) - 1);
		}

		return value;
	}
}

export class WriteStream {
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
			var byte = value & 0x7F;
			value >>>= 7;
			this._bytes.push(value ? byte | 0x80 : byte);
		} while (value);
	}

	varint(value) {
		var compare = value < 0 ? -1 : 0;

		do {
			var diff = ((value >> 1) ^ value) & 0x40;
			var byte = value & 0x7F;
			value >>= 7;

			var more = diff || value != compare;

			this._bytes.push(more ? byte | 0x80 : byte);
		} while (more);
	}
}
