#pragma once

#ifndef EXTERN
#define EXTERN extern
#endif

EXTERN union {
    struct {
        uint32_t lo;
        uint32_t hi;

		uint32_t regs[32];
		uint32_t pc;

		uint32_t start_pc;
		int clocks;
    };
    uint64_t wide;
} registers;

// These are the functions that get inlined
STATIC_FUNCTION uint32_t read_reg(int reg) {
	return reg ? registers.parts.regs[reg] : 0;
}

STATIC_FUNCTION void write_reg(int reg, uint32_t value) {
	if (reg) registers.parts.regs[reg] = value;
}
