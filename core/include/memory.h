#pragma once

#include <stdint.h>
#include "compiler.h"

#include "system.h"
#include "consts.h"

enum MemoryRegionFlags {
	FLAG_R = 1,
	FLAG_W = 2
};

typedef struct {
	const char*			name;
	uint32_t 			start;
	uint32_t 			end;
	const uint32_t* 	data;
	int 				flags;
} MemoryRegion;

extern uint32_t system_ram[RAM_SIZE / sizeof(uint32_t)];
extern uint32_t const system_rom[ROM_SIZE / sizeof(uint32_t)];

namespace Memory {
	uint32_t read(uint32_t logical, uint32_t code, SystemException& exception);
	void write(uint32_t logical, uint32_t value, uint32_t mask, SystemException& exception);
	EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc);
	EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc);
}
