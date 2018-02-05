#pragma once

namespace Hash {
	void reset();
	uint32_t find(uint32_t index);
	void clear(uint32_t index);
	void write(uint32_t index, uint32_t value);
}
