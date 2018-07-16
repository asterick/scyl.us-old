export class Fields {
    constructor(word = 0) {
        this.word = word;
    }

    // Standard decoding fields
    get opcode() { return (this.word >> 26) & 0b111111; }
    get funct() { return this.word & 0b111111; }
    get shamt() { return (this.word >> 6) & 0b11111; }
    get rd() { return (this.word >> 11) & 0b11111; }
    get rt() { return (this.word >> 16) & 0b11111; }
    get rs() { return (this.word >> 21) & 0b11111; }
    get imm16() { return this.word & 0xFFFF; }
    get simm16() { return this.word << 16 >> 16; }
    get imm20() { return (this.word >> 6) & 0xFFFFF; }
    get imm25() { return this.word & 0x1FFFFFF; }
    get imm26() { return this.word & 0x3FFFFFF; }
    get cop() { return (this.word >>> 26) & 3; }
}
