#pragma once

#ifndef EXTERN
#define EXTERN extern
#endif

EXTERN union {
    struct {
        uint32_t lo;
        uint32_t hi;
    } parts;
    uint64_t wide;
} mult;

EXTERN uint32_t registers[32];
EXTERN uint32_t pc;

EXTERN uint32_t start_pc;
EXTERN int clocks;

// These are the functions that get inlined
STATIC_FUNCTION uint32_t read_reg(int reg) {
	return reg ? registers[reg] : 0;
}

STATIC_FUNCTION void write_reg(int reg, uint32_t value) {
	if (reg) registers[reg] = value;
}
