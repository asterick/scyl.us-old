#include <stdint.h>

#include "mmu.h"

uint32_t MMU::translate(uint32_t address, uint32_t write, SystemException& exception) {
	return address;
}

void MMU::interrupt(SystemIRQ i) {

}
