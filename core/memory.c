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

