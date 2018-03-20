#pragma once

#include <stdint.h>

extern "C" {
	void execute(uint32_t, uint32_t);
	uint32_t exception(uint32_t code, uint32_t pc, uint32_t delayed, uint32_t cop);
	void invalidate(uint32_t physical);

	uint32_t cedar_read(uint32_t);
	void cedar_write(uint32_t, uint32_t, uint32_t);
	uint32_t gpu_read(uint32_t);
	void gpu_write(uint32_t, uint32_t, uint32_t);
	uint32_t dsp_read(uint32_t);
	void dsp_write(uint32_t, uint32_t, uint32_t);
	uint32_t spu_read(uint32_t);
	void spu_write(uint32_t, uint32_t, uint32_t);
}
