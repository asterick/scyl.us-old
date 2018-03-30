#pragma once

#include <stdint.h>
#include "compiler.h"

namespace GPU {
	bool rx_full();
	bool tx_empty();
	uint32_t read(uint32_t);
	void write(uint32_t, uint32_t, uint32_t);
}
