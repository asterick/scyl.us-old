#pragma once

#include <stdint.h>

namespace Timer {
	uint32_t read(uint32_t);
	void write(uint32_t, uint32_t, uint32_t);
}
