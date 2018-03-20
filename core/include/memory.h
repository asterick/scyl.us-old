#pragma once

#include <stdint.h>
#include "compiler.h"

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

static const uint32_t RAM_BASE = 0x00000000;
static const uint32_t ROM_BASE = 0x1FC00000;

extern uint32_t system_ram[];
extern uint32_t system_rom[];

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed);
EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);
