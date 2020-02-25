#pragma once

#include <stdint.h>

union Registers {
    struct {
		uint32_t regs[32];
        uint32_t lo;
        uint32_t hi;
		uint32_t pc;
		int clocks;
    };
    struct {
    	uint32_t _align[32];
    	uint64_t wide;
	};
};

extern union Registers registers;

// These are the functions that get inlined
static inline uint32_t read_reg(int reg) {
	return reg ? registers.regs[reg] : 0;
}

static inline void write_reg(int reg, uint32_t value) {
	if (reg) registers.regs[reg] = value;
}
