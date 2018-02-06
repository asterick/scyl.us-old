#pragma once

static uint32_t FIELD_OPCODE(uint32_t word) {
    return ((word >> 26) & 0b111111);
}
static uint32_t FIELD_FUNCT(uint32_t word) {
    return (word & 0b111111);
}
static uint32_t FIELD_SHAMT(uint32_t word) {
    return ((word >> 6) & 0b11111);
}
static uint32_t FIELD_RD(uint32_t word) {
    return ((word >> 11) & 0b11111);
}
static uint32_t FIELD_RT(uint32_t word) {
    return ((word >> 16) & 0b11111);
}
static uint32_t FIELD_RS(uint32_t word) {
    return ((word >> 21) & 0b11111);
}
static uint32_t FIELD_IMM16(uint32_t word) {
    return (word & 0xFFFF);
}
static uint32_t FIELD_SIMM16(uint32_t word) {
    return (((int32_t)word << 16) >> 16);
}
static uint32_t FIELD_IMM20(uint32_t word) {
    return ((word >> 6) & 0xFFFFF);
}
static uint32_t FIELD_IMM25(uint32_t word) {
    return (word & 0x1FFFFFF);
}
static uint32_t FIELD_IMM26(uint32_t word) {
    return (word & 0x3FFFFFF);
}
static uint32_t FIELD_COP(uint32_t word) {
    return ((word >> 26) & 3);
}
