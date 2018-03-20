#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "dma.h"
#include "cop0.h"

/****
 DMA CHANNEL REGISTER MAP
 ------------------------
 N+0 Flags
 N+1 Start Address
 N+2 End Address
 N+3 DMA Length

 Flags
 -------------------------
   31: Running
   30: Circular mode
16~23: Write stride (signed)
 8~15: Read stride (signed)
 6~ 7: Write width (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Packed)
 4~ 5: Read width  (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Packed)
 0~ 3: Trigger channel

 Trigger Channels
 -------------------------
   0: Always running
   1: GPU RX Fifo not-full
   2: GPU TX Fifo not-empty
   3: DSP Idle
   4: DSP Complete
 ****/

uint32_t dma_read(uint32_t page, uint32_t code, uint32_t logical, uint32_t pc, uint32_t delayed) {
	bus_fault(code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA, logical, pc, delayed);

	return 0;
}

void dma_write(uint32_t page, uint32_t value, uint32_t mask, uint32_t logical, uint32_t pc, uint32_t delayed) {
	bus_fault(EXCEPTION_BUSERRORDATA, logical, pc, delayed);
}
