#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "dma.h"
#include "cop0.h"
#include "memory.h"

static const int MAX_CHANNELS = 8;

struct DMAChannelFlags {
   unsigned active:1;
   unsigned circular:1;
   unsigned linked:1;
   signed   source_stride:8;
   signed   target_stride:8;
   unsigned source_width:4;
   unsigned target_width:4;
   unsigned trigger:4;
};

struct DMAChannel {
   DMAChannelFlags flags;
   uint32_t source;
   uint32_t target;
   uint32_t length;
};

DMAChannel channels[MAX_CHANNELS];

/****
 DMA CHANNEL REGISTER MAP
 ------------------------
 N+0 Flags
 N+1 Source Address
 N+2 Target Address
 N+3 DMA Length

 Flags
 -------------------------
   31: Running
   30: Circular mode
16~23: Write stride (signed)
 8~15: Read stride (signed)
 6~ 7: Write width (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Illegal)
 4~ 5: Read width  (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Illegal)
 0~ 3: Trigger channel

 Trigger Channels
 -------------------------
   0: Always running
   1~8: DMA[n] Stopped
   9: GPU RX Fifo not-full
   10: GPU TX Fifo not-empty
   11: DSP Idle
   12: DSP Complete
 ****/

EXPORT void dma_advance() {
   for (int i = 0; i < MAX_CHANNELS; i++) {
      if (!channels[i].flags.active) continue ;
   }
}

uint32_t dma_read(uint32_t address, uint32_t code, uint32_t logical, uint32_t pc, uint32_t delayed) {
   const int page = address & 0xFFFFC;

   // Out of bounds
   if (page + 3 >= sizeof(channels)) {
      bus_fault(code ? EXCEPTION_BUSERRORINSTRUCTION : EXCEPTION_BUSERRORDATA, logical, pc, delayed);
   }

   uint32_t* const raw = (uint32_t*)&channels;

   return raw[page >> 2];
}

void dma_write(uint32_t address, uint32_t value, uint32_t mask, uint32_t logical, uint32_t pc, uint32_t delayed) {
   const int page = address & 0xFFFFC;

   // Out of bounds
   if (page + 3 >= sizeof(channels)) {
      bus_fault(EXCEPTION_BUSERRORDATA, logical, pc, delayed);
   }

   uint32_t* const raw = (uint32_t*)&channels;

   raw[page >> 2] = (raw[page >> 2] & ~mask) | (value & mask);

   // Not a control register
   if (page & 0xC0) return ;

   dma_advance();
}
