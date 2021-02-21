#pragma once

#include <stdint.h>

struct Registers {
	uint32_t regs[32];
	uint32_t pc;
	int32_t clocks;
};

extern struct Registers registers;

// These are the functions that get inlined
static inline uint32_t read_reg(int reg) {
	return reg ? registers.regs[reg] : 0;
}

static inline void write_reg(int reg, uint32_t value) {
	if (reg) registers.regs[reg] = value;
}
