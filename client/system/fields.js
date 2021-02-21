function pick(word, from, to, bits) {
    const mask = ((1 << bits) - 1) << to;

    if (from > to) {
        return (word >>> (from - to)) & mask;
    } else if (from < to) {
        return (word << (to - from)) & mask;
    } else {
        return word & mask;
    }
}

export class Fields {
    constructor(word = 0) {
        this.word = word;
    }

    // Standard decoding fields
    get op(word) {
        return pick(word, 0, 0, 2);
    }

    get opcode(word) {
        return pick(word, 2, 0, 5);
    }

    get funct3(word) {
        return pick(word, 12, 0, 3);
    }

    get funct7(word) {
        return pick(word, 25, 0, 7);
    }

    get rd(word) {
        return pick(word, 7, 0, 5);
    }

    get rs1(word) {
        return pick(word, 15, 0, 5);
    }

    get rs2(word) {
        return pick(word, 20, 0, 5);
    }

    // Immediate fields
    get imm_i(word) {
        return  ((word & 0x80000000) ? 0xfffffc00 : 0)
                | pick(word, 20,  0, 1)
                | pick(word, 21,  1, 4)
                | pick(word, 25,  5, 5)
                ;
    }

    get imm_s(word) {
        return  ((word & 0x80000000) ? 0xfffffc00 : 0)
                | pick(word,  7,  0, 1)
                | pick(word,  8,  1, 4)
                | pick(word, 25,  5, 5)
                ;
    }

    get imm_b(word) {
        return  ((word & 0x80000000) ? 0xfffff800 : 0)
                | pick(word,  8,  1, 4)
                | pick(word, 25,  5, 5)
                | pick(word,  7, 11, 1)
                ;
    }

    get imm_u(word) {
        return word & 0xffffc000;
    }

    get imm_j(word) {
        return  ((word & 0x80000000) ? 0xfff00000 : 0)
                | pick(word, 21,  1, 4)
                | pick(word, 25,  5, 5)
                | pick(word, 20, 11, 1)
                | pick(word, 12, 12, 6)
                ;
    }
}
