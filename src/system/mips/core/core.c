#include "types.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

uint32_t start_pc;
uint32_t clocks; // How much time we need to catch up on
uint32_t registers[32];
uint32_t pc;

union {
    struct {
        uint32_t lo;
        uint32_t hi;
    } parts;
    uint64_t wide;
} mult;

uint32_t ram[1024*1024];	// 4MB of RAM
uint32_t rom[128*1024];		// 512kB of ROM

// These are the functions that get inlined
STATIC_FUNCTION uint32_t read_reg(int reg) {
	return reg ? registers[reg] : 0;
}

STATIC_FUNCTION void write_reg(int reg, uint32_t value) {
	if (reg) registers[reg] = value;
}

// *******
// ** Interface helpers
// *******

void reset() {
    pc = 0xBFC00000;
    clocks = 0;
}

uint32_t getStartPC() {
    return start_pc;
}

void setStartPC(uint32_t address) {
    start_pc = address;
}

uint32_t getPC() {
    return pc;
}

void setPC(uint32_t address) {
    pc = address;
}

uint32_t getHI() {
    return mult.parts.hi;
}

uint32_t getLO() {
    return mult.parts.lo;
}

void setClocks(int32_t time) {
    clocks = time;
}

int32_t getClocks() {
    return clocks;
}

#include "base.c"
#include "cop0.c"
