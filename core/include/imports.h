#pragma once

#include <stdint.h>
#include "consts.h"

#define DEBUG(...) { \
   const uint32_t values[] = { __VA_ARGS__ }; \
   debug(&values[0], sizeof(values)); \
}

extern "C" {
	void debug(const uint32_t*, int);
	void invalidate(uint32_t physical);
}

EXPORT uint32_t exception(uint32_t code, uint32_t pc);
EXPORT uint32_t translate(uint32_t logical, bool code, SystemException& problem);
EXPORT void adjust_clock(uint32_t cycles);
EXPORT void branch(uint32_t pc, uint32_t target);
EXPORT void execute(uint32_t);
