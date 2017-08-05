import { local, LOCAL_VARS } from "./wast";

export class FieldsNumeric {
    constructor(word = 0) {
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


    set opcode(value) { this._setField(value, 26, 0b111111) }
    set funct(value) { this._setField(value, 0, 0b111111) }
    set shamt(value) { this._setField(value, 6, 0b11111) }
    set rd(value) { this._setField(value, 11, 0b11111) }
    set rt(value) { this._setField(value, 16, 0b11111) }
    set rs(value) { this._setField(value, 21, 0b11111) }
    set cop(value) { this._setField(value, 26, 0b11) }
    set imm16(value) { this._setField(value, 0, 0xFFFF) }
    set simm16(value) { this._setField(value, 0, 0xFFFF) }
    set imm20(value) { this._setField(value, 0, 0xFFFFF) }
    set imm25(value) { this._setField(value, 0, 0x1FFFFFF) }
    set imm26(value) { this._setField(value, 0, 0x3FFFFFF) }

    _setField(value, shift, area) {
        const mask = area << shift;
        this._word = (this._word & ~mask) | ((value << shift) & mask);
    }
}

export const FieldsWasmDynamic = {
    opcode: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 26},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0b111111},
        { op: 'i32.and'}
    ],
    funct: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 0b111111},
        { op: 'i32.and'}
    ],
    shamt: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 6},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0b11111},
        { op: 'i32.and'}
    ],
    rd: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 11},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0b11111},
        { op: 'i32.and'}
    ],
    rt: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 16},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0b11111},
        { op: 'i32.and'}
    ],
    rs: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 21},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0b11111},
        { op: 'i32.and'}
    ],
    imm16: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 0xFFFF},
        { op: 'i32.and'}
    ],
    simm16: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 16},
        { op: 'i32.shl'},
        { op: 'i32.const', value: 16},
        { op: 'i32.shr_s'},

    ],
    imm20: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 6},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 0xFFFFF},
        { op: 'i32.and'}
    ],
    imm25: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 0x1FFFFFF},
        { op: 'i32.and'}
    ],
    imm26: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 0x3FFFFFF},
        { op: 'i32.and'}
    ],
    cop: [
        ... local(LOCAL_VARS.INSTRUCTION_WORD),
        { op: 'i32.const', value: 26},
        { op: 'i32.shr_u'},
        { op: 'i32.const', value: 3},
        { op: 'i32.and'}
    ]
};
