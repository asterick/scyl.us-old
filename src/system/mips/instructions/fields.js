import { LOCAL_VARS } from "./wast";

export class NumericFields {
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

export class FieldsWasm {
    static dynamic() {
        return new FieldsWasm({ op: 'get_local', index: LOCAL_VARS.INSTRUCTION_WORD });
    }

    static fixed(word) {
        return new FieldsWasm({ op: 'i32.const', value: word });
    }

    constructor(field) {
        this._field = field;
    }

    get opcode() {
        return [
            this._field,
            { op: 'i32.const', value: 26},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0b111111},
            { op: 'i32.and'}
        ]
    }
    get funct() {
        return [
            this._field,
            { op: 'i32.const', value: 0b111111},
            { op: 'i32.and'}
        ]
    }
    get shamt() {
        return [
            this._field,
            { op: 'i32.const', value: 6},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0b11111},
            { op: 'i32.and'}
        ]
    }
    get rd() {
        return [
            this._field,
            { op: 'i32.const', value: 11},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0b11111},
            { op: 'i32.and'}
        ]
    }
    get rt() {
        return [
            this._field,
            { op: 'i32.const', value: 16},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0b11111},
            { op: 'i32.and'}
        ]
    }
    get rs() {
        return [
            this._field,
            { op: 'i32.const', value: 21},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0b11111},
            { op: 'i32.and'}
        ]
    }
    get imm16() {
        return [
            this._field,
            { op: 'i32.const', value: 0xFFFF},
            { op: 'i32.and'}
        ]
    }
    get simm16() {
        return [
            this._field,
            { op: 'i32.const', value: 16},
            { op: 'i32.shl'},
            { op: 'i32.const', value: 16},
            { op: 'i32.shr_s'},

        ]
    }
    get imm20() {
        return [
            this._field,
            { op: 'i32.const', value: 6},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 0xFFFFF},
            { op: 'i32.and'}
        ]
    }
    get imm25() {
        return [
            this._field,
            { op: 'i32.const', value: 0x1FFFFFF},
            { op: 'i32.and'}
        ]
    }
    get imm26() {
        return [
            this._field,
            { op: 'i32.const', value: 0x3FFFFFF},
            { op: 'i32.and'}
        ]
    }
    get cop() {
        return [
            this._field,
            { op: 'i32.const', value: 26},
            { op: 'i32.shr_u'},
            { op: 'i32.const', value: 3},
            { op: 'i32.and'}
        ]
    }
}
