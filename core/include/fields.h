#pragma once

#include <stdint.h>

#define OPCODE_SHIFT	(2)
#define OPCODE_MASK		(0b11111)
#define FUNCT3_SHIFT	(12)
#define FUNCT3_MASK		(0b111)
#define FUNCT7_SHIFT	(25)
#define FUNCT7_MASK		(0b1111111)
#define RS1_SHIFT		(15)
#define RS1_MASK		(0b11111)
#define RS2_SHIFT		(20)
#define RS2_MASK		(0b11111)
#define RD_SHIFT		(7)
#define RD_MASK			(0b11111)

static inline uint32_t FIELD_OPCODE(uint32_t word) {
    return (word >> OPCODE_SHIFT) & OPCODE_MASK;
}

static inline uint32_t FIELD_FUNCT3(uint32_t word) {
    return (word >> FUNCT3_SHIFT) & FUNCT3_MASK;
}

static inline uint32_t FIELD_FUNCT7(uint32_t word) {
    return (word >> FUNCT7_SHIFT) & FUNCT7_MASK;
}

static inline uint32_t FIELD_RS1(uint32_t word) {
    return (word >> RS1_SHIFT) & RS1_MASK;
}

static inline uint32_t FIELD_RS2(uint32_t word) {
    return (word >> RS2_SHIFT) & RS2_MASK;
}

static inline uint32_t FIELD_RD(uint32_t word) {
    return (word >> RD_SHIFT) & RD_MASK;
}
