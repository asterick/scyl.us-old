#pragma once

#include <stdint.h>
#include "compiler.h"
#include "system.h"
#include "consts.h"

EXPORT uint32_t translate(uint32_t address, uint32_t write, uint32_t pc);
EXPORT void trap(int exception, int address);

namespace MMU {
	uint32_t translate(uint32_t address, uint32_t write, SystemException& exception);
	void interrupt(SystemIRQ i);
}
