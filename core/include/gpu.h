#pragma once

#include <stdint.h>
#include "compiler.h"

namespace GPU {
	uint32_t read(uint32_t);
	void write(uint32_t, uint32_t, uint32_t);
}
