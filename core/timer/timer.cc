#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "timer.h"
#include "cop0.h"

uint32_t timer_read(uint32_t page, uint32_t code, uint32_t logical, uint32_t pc, uint32_t delayed) {
	bus_fault(code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA, logical, pc, delayed);

	return 0;
}

void timer_write(uint32_t page, uint32_t value, uint32_t mask, uint32_t logical, uint32_t pc, uint32_t delayed) {
	bus_fault(EXCEPTION_BUSERRORDATA, logical, pc, delayed);
}
