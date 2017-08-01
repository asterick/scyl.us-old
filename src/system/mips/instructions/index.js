import Instructions from "./process!./base";

// Field decode helper object
class Fields {
	constructor(word) {
		this._word = word;
	}

	// Standard decoding fields
	get opcode() { return (this._word >> 26) & 0b111111; }
	get funct() { return this._word & 0b111111; }
	get shamt() { return (this._word >> 6) & 0b11111; }
	get rd() { return (this._word >> 11) & 0b11111; }
	get rt() { return (this._word >> 16) & 0b11111; }
	get rs() { return (this._word >> 21) & 0b11111; }
	get imm16() { return this._word & 0xFFFF; }
	get simm16() { return this._word << 16 >> 16; }
	get imm20() { return (this._word >> 6) & 0xFFFFF; }
	get imm25() { return this._word & 0x1FFFFFF; }
	get imm26() { return this._word & 0x3FFFFFF; }
	get cop() { return (this._word >>> 26) & 3 }
}

export default function (word) {
	const fields = new Fields(word);
	var entry = Instructions;
	var fallback = null;

	while (typeof entry === "object") {
		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.instruction = entry || fallback;

	return fields;
}
