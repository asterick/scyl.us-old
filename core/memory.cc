#include <stdint.h>

#include "compiler.h"
#include "imports.h"

#include "registers.h"
#include "memory.h"
#include "cop0.h"

union Registers registers;

uint32_t ram[RAM_SIZE / sizeof(uint32_t)];
uint32_t rom[ROM_SIZE / sizeof(uint32_t)] = {
	#include "system0.h"
};

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, code, pc, delayed);

	if (physical < sizeof(ram)) {
		return ram[physical >> 2];
	} else if (physical >= ROM_BASE && physical < (ROM_BASE + ROM_SIZE)) {
		physical = physical - ROM_BASE;

		if (physical >= sizeof(rom)) return 0;

		return rom[physical >> 2];
	} else {
		return read(physical, code, pc, delayed);
	}
}

EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 1, pc, delayed);

	if (physical < sizeof(ram)) {
		physical >>= 2;
		invalidate(physical, logical);
		ram[physical] = (ram[physical] & ~mask) | (value & mask);
	} else if (physical < ROM_BASE || physical >= (ROM_BASE + ROM_SIZE)) {
		write(physical, value, mask, pc, delayed);
	}
}
