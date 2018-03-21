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

uint32_t read(uint32_t physical, bool& exception) {
	if (exception) return 0;

	switch (physical & 0x1FF00000) {
		case DMA_BASE: return dma_read(physical);
		case TIMER_BASE: return timer_read(physical);
		case CEDAR_BASE: return cedar_read(physical);
		case GPU_BASE: return gpu_read(physical);
		case DSP_BASE: return dsp_read(physical);
		case SPU_BASE: return spu_read(physical);
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

	exception = true;

	return ~0;
}

void write(uint32_t physical, uint32_t value, uint32_t mask, bool& exception) {
	if (exception) return ;

	invalidate(physical);

	switch (physical & 0x1FF00000) {
		case DMA_BASE: dma_write(physical, value, mask); return ;
		case TIMER_BASE: timer_write(physical, value, mask); return ;
		case CEDAR_BASE: cedar_write(physical, value, mask); return ;
		case GPU_BASE: gpu_write(physical, value, mask); return ;
		case DSP_BASE: dsp_write(physical, value, mask); return ;
		case SPU_BASE: spu_write(physical, value, mask); return ;
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

	exception = true;
}

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, code, pc, delayed);

	bool exception = false;
	uint32_t value = read(physical, exception);

	if (exception) bus_fault(code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA, logical, pc, delayed);
	return value;
}

EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 1, pc, delayed);

	bool exception = false;
	write(physical, value, mask, exception);

	if (exception) bus_fault(EXCEPTION_BUSERRORDATA, logical, pc, delayed);
}
