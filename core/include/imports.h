#pragma once

extern "C" {
	void execute(uint32_t, uint32_t);
	uint32_t exception(uint32_t code, uint32_t pc, uint32_t delayed, uint32_t cop);
	uint32_t read(uint32_t address, uint32_t code, uint32_t pc, uint32_t delayed);
	uint32_t write(uint32_t address, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);
	void invalidate(uint32_t physical, uint32_t logical);
	void setRegisterSpace(void *);
	void setMemoryRegions(const void*);
}
