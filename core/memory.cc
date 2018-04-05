#include <stdint.h>
#include <stddef.h>

#include "compiler.h"
#include "imports.h"
#include "system.h"

#include "registers.h"
#include "memory.h"
#include "mmu.h"
#include "consts.h"

#include "dma.h"
#include "timer.h"
#include "gpu.h"

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
	uint32_t cedar_read(uint32_t);
	void cedar_write(uint32_t, uint32_t, uint32_t);
	uint32_t dsp_read(uint32_t);
	void dsp_write(uint32_t, uint32_t, uint32_t);
	uint32_t spu_read(uint32_t);
	void spu_write(uint32_t, uint32_t, uint32_t);
}

EXPORT uint32_t blockSize(uint32_t address) {
	if ((address & 0xC0000000) != 0xC0000000) {
		return MIN_COMPILE_SIZE;
	} else {
		return MAX_COMPILE_SIZE;
	}
}

uint32_t Memory::read(uint32_t logical, bool code, SystemException& problem) {
	uint32_t physical = MMU::translate(logical, false, problem);

	if (problem != EXCEPTION_NONE) return -1;

	switch (physical & 0xFFF00000) {
		case DMA_BASE: return DMA::read(physical);
		case TIMER_BASE: return Timer::read(physical);
		case CEDAR_BASE: return cedar_read(physical);
		case GPU_BASE: return GPU::read(physical);
		case DSP_BASE: return dsp_read(physical);
		case SPU_BASE: return spu_read(physical);
		case ROM_BASE + 0x000000:
		case ROM_BASE + 0x100000:
		case ROM_BASE + 0x200000:
		case ROM_BASE + 0x300000:
			if (physical >= ROM_BASE && physical < ROM_BASE + sizeof(system_ram)) {
				return system_rom[(physical - ROM_BASE) >> 2] % RAM_SIZE;
			}
			break ;
		default:
			{
				int index = (physical - RAM_BASE) % RAM_SIZE;
				return system_ram[index >> 2];
			}
	}

	problem = code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA;

	return ~0;
}

void Memory::write(uint32_t logical, uint32_t value, uint32_t mask, SystemException& problem) {
	uint32_t physical = MMU::translate(logical, true, problem);

	if (problem != EXCEPTION_NONE) return ;

	invalidate(physical);

	switch (physical & 0xFFF00000) {
		case DMA_BASE: DMA::write(physical, value, mask); return ;
		case TIMER_BASE: Timer::write(physical, value, mask); return ;
		case CEDAR_BASE: cedar_write(physical, value, mask); return ;
		case GPU_BASE: GPU::write(physical, value, mask); return ;
		case DSP_BASE: dsp_write(physical, value, mask); return ;
		case SPU_BASE: spu_write(physical, value, mask); return ;
		case ROM_BASE + 0x000000:
		case ROM_BASE + 0x100000:
		case ROM_BASE + 0x200000:
		case ROM_BASE + 0x300000:
			break ;
		default:
			{
				int index = (physical - RAM_BASE) % RAM_SIZE;
				system_ram[physical >> 2] = (system_ram[physical >> 2] & ~mask) | (value & mask);
				break ;
			}
	}
}

EXPORT uint32_t Memory::load(uint32_t logical, bool code, uint32_t pc) {
	SystemException problem = EXCEPTION_NONE;

	uint32_t value = read(logical, code, problem);

	if (problem != EXCEPTION_NONE) {
		exception(problem, pc);
	}

	return value;
}

EXPORT void Memory::store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc) {
	SystemException problem = EXCEPTION_NONE;

	write(logical, value, mask, problem);

	if (problem != EXCEPTION_NONE) {
		exception(problem, pc);
	}
}
