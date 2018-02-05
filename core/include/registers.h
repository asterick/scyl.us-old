#pragma once

union Registers {
    struct {
		uint32_t regs[32];
        uint32_t lo;
        uint32_t hi;
		uint32_t pc;
		uint32_t start_pc;
		int clocks;
    };
    struct {
    	uint32_t _align[32];
    	uint64_t wide;
	};
};

EXTERN union Registers registers;

// These are the functions that get inlined
STATIC_FUNCTION uint32_t read_reg(int reg) {
	return reg ? registers.regs[reg] : 0;
}

STATIC_FUNCTION void write_reg(int reg, uint32_t value) {
	if (reg) registers.regs[reg] = value;
}
