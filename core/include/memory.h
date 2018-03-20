#pragma once

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

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed);
EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);
