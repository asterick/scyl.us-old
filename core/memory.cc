#include <stdint.h>
#include <stddef.h>

#include "compiler.h"
#include "imports.h"

#include "registers.h"
#include "memory.h"
#include "cop0.h"
#include "consts.h"

#include "dma.h"
#include "timer.h"

union Registers registers;

uint32_t system_ram[0x400000 / sizeof(uint32_t)];		// 4MB
uint32_t system_rom[0x080000 / sizeof(uint32_t)] = {	// 512KB
	#include "system0.h"
};

const MemoryRegion memory_regions[] = {
    { "boot",  ROM_BASE, sizeof(system_rom), system_rom, FLAG_R },
    { "m_ram", RAM_BASE, sizeof(system_ram), system_ram, FLAG_R | FLAG_W },
    { NULL }
};

EXPORT uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, code, pc, delayed);

	switch (physical & 0x1FF00000) {
		case 0x1F000000: return dma_read(physical);
		case 0x1F100000: return timer_read(physical);
		case 0x1F200000: return cedar_read(physical);
		case 0x1F300000: return gpu_read(physical);
		case 0x1F400000: return dsp_read(physical);
		case 0x1F500000: return spu_read(physical);
		case 0x1F600000:
		case 0x1F700000:
		case 0x1F800000:
		case 0x1F900000:
		case 0x1FA00000:
		case 0x1FB00000: break ;
		case 0x1FC00000:
		case 0x1FD00000:
		case 0x1FE00000:
		case 0x1FF00000:
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

	bus_fault(code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA, logical, pc, delayed);

	return 0;
}

EXPORT void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 1, pc, delayed);

	invalidate(physical, logical);

	switch (physical & 0x1FF00000) {
		case 0x1F000000: dma_write(physical, value, mask); return ;
		case 0x1F100000: timer_write(physical, value, mask); return ;
		case 0x1F200000: cedar_write(physical, value, mask); return ;
		case 0x1F300000: gpu_write(physical, value, mask); return ;
		case 0x1F400000: dsp_write(physical, value, mask); return ;
		case 0x1F500000: spu_write(physical, value, mask); return ;
		case 0x1F600000:
		case 0x1F700000:
		case 0x1F800000:
		case 0x1F900000:
		case 0x1FA00000:
		case 0x1FB00000: break ;
		case 0x1FC00000:
		case 0x1FD00000:
		case 0x1FE00000:
		case 0x1FF00000:
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

	bus_fault(EXCEPTION_BUSERRORDATA, logical, pc, delayed);
}
