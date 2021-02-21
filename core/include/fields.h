#pragma once

#include <stdint.h>

static inline int32_t pick(uint32_t word, uint32_t from, uint32_t to, uint32_t bits) {
    const uint32_t mask = ((1 << bits) - 1) << to;

    if (from > to) {
        return (word >> (from - to)) & mask;
    } else if (from < to) {
        return (word << (to - from)) & mask;
    } else {
        return word & mask;
    }
}

static inline int32_t FIELD_OPCODE(uint32_t word) {
    return pick(word, 0, 0, 7);
}

static inline int32_t FIELD_FUNCT3(uint32_t word) {
    return pick(word, 12, 0, 3);
}

static inline int32_t FIELD_FUNCT7(uint32_t word) {
    return pick(word, 25, 0, 7);
}

static inline int32_t FIELD_RD(uint32_t word) {
    return pick(word, 7, 0, 5);
}

static inline int32_t FIELD_RS1(uint32_t word) {
    return pick(word, 15, 0, 5);
}

static inline int32_t FIELD_RS2(uint32_t word) {
    return pick(word, 20, 0, 5);
}

static inline int32_t FIELD_IMM_I(uint32_t word) {
    return  ((word & 0x80000000) ? 0xFFFFFC00 : 0)
            | pick(word, 20,  0, 1)
            | pick(word, 21,  1, 4)
            | pick(word, 25,  5, 5)
            ;
}

static inline int32_t FIELD_IMM_S(uint32_t word) {
    return  ((word & 0x80000000) ? 0xFFFFFC00 : 0)
            | pick(word,  7,  0, 1)
            | pick(word,  8,  1, 4)
            | pick(word, 25,  5, 5)
            ;
}

static inline int32_t FIELD_IMM_B(uint32_t word) {
    return  ((word & 0x80000000) ? 0xFFFFF800 : 0)
            | pick(word,  8,  1, 4)
            | pick(word, 25,  5, 5)
            | pick(word,  7, 11, 1)
            ;
}

static inline int32_t FIELD_IMM_U(uint32_t word) {
    return word & 0xFFFFC000;
}

static inline int32_t FIELD_IMM_J(uint32_t word) {
    return  ((word & 0x80000000) ? 0xFFF00000 : 0)
            | pick(word, 21,  1, 4)
            | pick(word, 25,  5, 5)
            | pick(word, 20, 11, 1)
            | pick(word, 12, 12, 6)
            ;
}
