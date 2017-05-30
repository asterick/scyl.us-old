export default class Fields {
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
	get imm20() { return (this._word >> 6) & 0xFFFFF; }
	get imm25() { return this._word & 0x1FFFFFF; }
	get imm26() { return this._word & 0x3FFFFFF; }

	get simm16() { return this._word << 16 >> 16; }
}
