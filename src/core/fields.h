#pragma once

#define FIELD_OPCODE    ((word >> 26) & 0b111111)
#define FIELD_FUNCT     (word & 0b111111)
#define FIELD_SHAMT     ((word >> 6) & 0b11111)
#define FIELD_RD        ((word >> 11) & 0b11111)
#define FIELD_RT        ((word >> 16) & 0b11111)
#define FIELD_RS        ((word >> 21) & 0b11111)
#define FIELD_IMM16     (word & 0xFFFF)
#define FIELD_SIMM16    (((int32_t)word << 16) >> 16)
#define FIELD_IMM20     ((word >> 6) & 0xFFFFF)
#define FIELD_IMM25     (word & 0x1FFFFFF)
#define FIELD_IMM26     (word & 0x3FFFFFF)
#define FIELD_COP       ((word >> 26) & 3)
