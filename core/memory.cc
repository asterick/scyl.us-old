#include <stdint.h>
#include <stddef.h>

#include "compiler.h"
#include "imports.h"
#include "system.h"

#include "registers.h"
#include "memory.h"
#include "cop0.h"
#include "consts.h"

#include "dma.h"
#include "timer.h"
#include "gpu.h"
#include "spu.h"
#include "cedar.h"

union Registers registers;

uint32_t system_ram[RAM_SIZE / sizeof(uint32_t)];
uint32_t const system_rom[ROM_SIZE / sizeof(uint32_t)] = {
	#include "system0.h"
};

const MemoryRegion memory_regions[] = {
    { "boot",  ROM_BASE, sizeof(system_rom), system_rom, FLAG_R },
    { "m_ram", RAM_BASE, sizeof(system_ram), system_ram, FLAG_R | FLAG_W },
    { NULL }
};

extern "C" {
	uint32_t dsp_read(uint32_t);
	void dsp_write(uint32_t, uint32_t, uint32_t);
}

uint32_t Memory::read(uint32_t logical, uint32_t code, SystemException& problem) {
	uint32_t physical = COP0::translate(logical, false, problem);

	if (problem != EXCEPTION_NONE) return -1;

	switch (physical & 0x1FF00000) {
		case DMA_BASE: return DMA::read(physical);
		case TIMER_BASE: return Timer::read(physical);
		case CEDAR_BASE: return Cedar::read(physical);
		case GPU_BASE: return GPU::read(physical);
		case DSP_BASE: return dsp_read(physical);
		case SPU_BASE: return SPU::read(physical);
		case ROM_BASE + 0x000000:
		case ROM_BASE + 0x100000:
		case ROM_BASE + 0x200000:
		case ROM_BASE + 0x300000:
			if (physical >= ROM_BASE && physical < ROM_BASE + sizeof(system_ram)) {
				return system_rom[(physical - ROM_BASE) >> 2];
			}
			break ;
		default:
			if (physical < sizeof(system_ram)) {
				return system_ram[physical >> 2];
			}
			break ;
	}

	problem = code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA;

	return ~0;
}

void Memory::write(uint32_t logical, uint32_t value, uint32_t mask, SystemException& problem) {
	uint32_t physical = COP0::translate(logical, true, problem);

	if (problem != EXCEPTION_NONE) return ;

	invalidate(physical);

	switch (physical & 0x1FF00000) {
		case DMA_BASE: DMA::write(physical, value, mask); return ;
		case TIMER_BASE: Timer::write(physical, value, mask); return ;
		case CEDAR_BASE: Cedar::write(physical, value, mask); return ;
		case GPU_BASE: GPU::write(physical, value, mask); return ;
		case DSP_BASE: dsp_write(physical, value, mask); return ;
		case SPU_BASE: SPU::write(physical, value, mask); return ;
		case ROM_BASE + 0x000000:
		case ROM_BASE + 0x100000:
		case ROM_BASE + 0x200000:
		case ROM_BASE + 0x300000:
			if (physical >= ROM_BASE && physical < ROM_BASE + sizeof(system_rom)) {
				return ;
			}
			break ;
		default:
			// Out of bounds
			if (physical < sizeof(system_ram)) {
				system_ram[physical >> 2] = (system_ram[physical >> 2] & ~mask) | (value & mask);
				return ;
			}
			break ;
	}

	problem = EXCEPTION_BUSERRORDATA;
}

EXPORT uint32_t Memory::load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed) {
	SystemException problem = EXCEPTION_NONE;

	uint32_t value = read(logical, code, problem);

	if (problem != EXCEPTION_NONE) {
		COP0::bad_addr = logical;
		exception(problem, pc, delayed, 0);
	}

	return value;
}

EXPORT void Memory::store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	SystemException problem = EXCEPTION_NONE;

	write(logical, value, mask, problem);

	if (problem != EXCEPTION_NONE) {
		COP0::bad_addr = logical;
		exception(problem, pc, delayed, 0);
	}
}
