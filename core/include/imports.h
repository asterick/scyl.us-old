#pragma once

#include <stdint.h>

#define DEBUG(...) { \
   const uint32_t values[] = { __VA_ARGS__ }; \
   debug(&values[0], sizeof(values)); \
}

extern "C" {
	void debug(const uint32_t*, int);
	void execute(uint32_t, uint32_t);
	uint32_t exception(uint32_t code, uint32_t pc, uint32_t delayed, uint32_t cop);
	void invalidate(uint32_t physical);
}

EXPORT void adjust_clock(uint32_t cycles);
