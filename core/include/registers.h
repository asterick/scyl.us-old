#pragma once

#include <stdint.h>

union Registers {
    // Clocks for 
    int clocks;

	uint32_t r[16];
    uint32_t fiq[7];
    uint32_t svc[2];
    uint32_t abt[2];
    uint32_t irq[2];
    uint32_t und[2];

    uint32_t cpsr;
    uint32_t spsr_fiq;
    uint32_t spsr_svc;
    uint32_t spsr_abt;
    uint32_t spsr_irq;
};

extern union Registers registers;

// These are the functions that get inlined
static uint32_t read_reg(int reg) {
	return reg ? registers.regs[reg] : 0;
}

static void write_reg(int reg, uint32_t value) {
	if (reg) registers.regs[reg] = value;
}
