#pragma once

static const uint32_t ROM_BASE = 0x1FC00000;
static const uint32_t ROM_SIZE = 512*1024;		// 512kB of rom
static const uint32_t RAM_BASE = 0;				// 4MB of RAM
static const uint32_t RAM_SIZE = 4*1024*1024;	// 4MB of RAM

extern uint32_t ram[RAM_SIZE / sizeof(uint32_t)];
extern uint32_t rom[ROM_SIZE / sizeof(uint32_t)];

enum MemoryRegionFlags {
	FLAG_R = 1,
	FLAG_W = 2,
	FLAG_LAST = 4
};

typedef struct {
	const char*			name;
	uint32_t 			start;
	uint32_t 			end;
	const uint32_t* 	data;
	int 				flags;
} MemoryRegion;

extern const MemoryRegion memory_regions[];

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed);
EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);
