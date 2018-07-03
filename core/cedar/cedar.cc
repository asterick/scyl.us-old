#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "cedar.h"
#include "cop0.h"

uint32_t Cedar::read(uint32_t address) {
	return ~0;
}

void Cedar::write(uint32_t address, uint32_t value, uint32_t mask) {
}
