#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "dma.h"
#include "cop0.h"
#include "memory.h"

static const int MAX_CHANNELS = 8;

enum DMATrigger {
   TRIGGER_NONE = 0,
   TRIGGER_DMA0,
   TRIGGER_DMA1,
   TRIGGER_DMA2,
   TRIGGER_DMA3,
   TRIGGER_DMA4,
   TRIGGER_DMA5,
   TRIGGER_DMA6,
   TRIGGER_DMA7,
   TRIGGER_GPU_TX_FIFO,
   TRIGGER_GPU_RX_FIFO,
   TRIGGER_DSP_IDLE,
   TRIGGER_DSP_FINISHED
};

enum DMAWidth {
   WIDTH_BIT8,
   WIDTH_BIT16,
   WIDTH_BIT32
};

struct DMAChannelFlags {
   unsigned exception:1;
   unsigned active:1;
   unsigned trigger:4;
   unsigned copy_width:4;
   signed   source_stride:4;
   signed   target_stride:4;
   unsigned repeats:8;
};

struct DMAChannel {
   DMAChannelFlags flags;
   uint32_t source;
   uint32_t target;
   uint32_t length;
};

#define WORD_LENGTH (sizeof(channels) * MAX_CHANNELS / sizeof(uint32_t))

static union {
   DMAChannel channels[MAX_CHANNELS];
   uint32_t raw[WORD_LENGTH];
};

static union {
   DMAChannel shadow[MAX_CHANNELS];
   uint32_t raw_shadow[WORD_LENGTH];
};

static bool active = false;

EXPORT void dma_advance() {
   if (!active) return ;

   active = false;
   for (int i = 0; i < MAX_CHANNELS; i++) {
      DMAChannel& channel = channels[i];

      if (channel.flags.active == 0) continue ;
      active = true;

      bool exception = false;

      // TODO: FOR NO TRIGGER, RAM/ROM COPIES
      // THIS SHOULD USE A FAST ENGINE INSTEAD

      for (;;) {
         const uint32_t source = lookup(channel.source, false, exception);
         const uint32_t value = read(source, exception);
         const uint32_t target = lookup(channel.target, true, exception);
         write(target, value, 0xFFFFFFFF, exception);

         if (exception) {
            channel.flags.exception = 1;
            channel.flags.active = 0;
            break ;
         }

         channel.source += channel.flags.source_stride;
         channel.target += channel.flags.target_stride;

         // The system is no longer active
         if (--channel.length == 0) {
            // No longer active
            if (--channel.flags.repeats == 0) {
               channel.flags.active = 0;
               break ;   
            }

            // Reset source address
            channel.source = shadow[i].source;
            channel.length = shadow[i].length;
         }
      }
   }
}

uint32_t dma_read(uint32_t address) {
   const int page = (address & 0xFFFFC) >> 2;

   // Out of bounds
   if (page >= WORD_LENGTH) {
      return ~0;
   }

   uint32_t* const raw = (uint32_t*)&channels;

   return raw[page];
}

void dma_write(uint32_t address, uint32_t value, uint32_t mask) {
   const int page = (address & 0xFFFFC) >> 2;

   // Out of bounds
   if (page >= WORD_LENGTH) {
      return ;
   }

   raw_shadow[page] = raw[page] = (raw[page] & ~mask) | (value & mask);

   // Not a control register
   if (page & 0x3) return ;

   active = true;
   dma_advance();
}
