#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "spu.h"

uint32_t SPU::read(uint32_t address) {
	return ~0;
}

void SPU::write(uint32_t address, uint32_t value, uint32_t mask) {
}
