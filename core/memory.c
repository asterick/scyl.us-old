#include "types.h"
#include "imports.h"

uint32_t ram[1024*1024];    // 4MB of RAM
uint32_t rom[128*1024] = {
	#include "../system0/system0.h"
};

uint32_t* getAddressROM() {
	return &rom[0];
}

uint32_t getSizeROM() {
	return sizeof(rom);
}

uint32_t* getAddressRAM() {
	return &ram[0];
}

uint32_t getSizeRAM() {
	return sizeof(ram);
}

uint32_t load(uint32_t logical, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 0, pc, delayed);

	return read(physical, pc, delayed);
}

void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 1, pc, delayed);

	invalidate(physical, logical);

	write(physical, value, mask, pc, delayed);
}
