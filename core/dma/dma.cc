#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "dma.h"
#include "cop0.h"
#include "memory.h"
#include "registers.h"
#include "memory.h"

static const int MAX_CHANNELS = 8;

enum DMATrigger {
   TRIGGER_NONE,
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
   unsigned width:4;
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

static inline uint32_t adjust(const int shift, const uint32_t value) {
   switch (shift) {
      case 1:  case -3: return (value >> 24) | (value <<  8);
      case 2:  case -2: return (value >> 16) | (value << 16);
      case 3:  case -1: return (value >>  8) | (value << 24);
      default: return value;
   }
}

static bool check_trigger(int channel) {
   switch (channel) {
   case TRIGGER_NONE: return true;
   case TRIGGER_DMA0: return channels[0].flags.active == 0;
   case TRIGGER_DMA1: return channels[1].flags.active == 0;
   case TRIGGER_DMA2: return channels[2].flags.active == 0;
   case TRIGGER_DMA3: return channels[3].flags.active == 0;
   case TRIGGER_DMA4: return channels[4].flags.active == 0;
   case TRIGGER_DMA5: return channels[5].flags.active == 0;
   case TRIGGER_DMA6: return channels[6].flags.active == 0;
   case TRIGGER_DMA7: return channels[7].flags.active == 0;

   // Unimplemented (currently locks the channel)
   case TRIGGER_GPU_TX_FIFO:
   case TRIGGER_GPU_RX_FIFO:
   case TRIGGER_DSP_IDLE:
   case TRIGGER_DSP_FINISHED:
   default:
      return false;
   }
}

EXPORT void dma_advance() {
   if (!active) return ;

   active = false;
   for (int i = 0; i < MAX_CHANNELS; i++) {
      DMAChannel& channel = channels[i];

      if (channel.flags.active == 0) continue ;
      active = true;

      bool exception = false;
      while (check_trigger(channel.flags.trigger)) {
         uint32_t source = lookup(channel.source, false, exception);
         uint32_t value = read(source, exception);
         uint32_t target = lookup(channel.target, true, exception);

         value = adjust((target & 3) - (source & 3), value);
         registers.clocks -= 2; // No cross bar

         switch (channel.flags.width) {
            case WIDTH_BIT8:
               write(target, value, 0xFF << ((source & 3) * 8), exception);
               break ;
            case WIDTH_BIT16:
               write(target, value, (target & 2) ? 0xFFFF0000 : 0x0000FFFF, exception);
               break ;
            case WIDTH_BIT32:
               write(target, value, 0xFFFFFFFF, exception);
               break ;
            default:
               exception = true;
               break ;
         }

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

static inline void fast_dma(DMAChannel& channel) {
   int word_width;

   // Verify alignment and stride
   switch (channel.flags.width) {
      case WIDTH_BIT8:
         if (channel.flags.source_stride != 1 || channel.flags.source_stride != 1) return ;
         word_width = 1;
         break ;
      case WIDTH_BIT16:
         if (channel.flags.source_stride != 2 || channel.flags.source_stride != 2) return ;
         if ((channel.source | channel.target) & 1) return ;
         
         word_width = 2;
         break ;
      case WIDTH_BIT32:
         if (channel.flags.source_stride != 4 || channel.flags.source_stride != 4) return ;
         if ((channel.source | channel.target) & 3) return ;

         word_width = 4;
         break ;
      default:
         return ;
   }

   int copy_length = channel.length * word_width;
   int length = channel.length * channel.flags.repeats * word_width;

   const uint8_t* source;
   uint8_t* target;

   // Determine if source is in linear memory
   if (channel.source >= RAM_BASE && channel.source < RAM_BASE + RAM_SIZE) {
      const int offset = channel.source - RAM_BASE;
      const int max_length = RAM_SIZE - offset;

      source = (const uint8_t*)system_ram + offset;

      if (length > max_length) length = max_length;
   } else if (channel.source >= ROM_BASE && channel.source < ROM_BASE + ROM_SIZE) {
      const int offset = (channel.source - ROM_BASE);
      const int max_length = ROM_SIZE - offset;

      source = (const uint8_t*)system_rom + offset;
      if (length > max_length) length = max_length;
   } else {
      return ;
   }

   // Determine if target is in ram
   if (channel.target >= RAM_BASE && channel.target < RAM_BASE + RAM_SIZE) {
      const int offset = channel.target - RAM_BASE;
      const int max_length = RAM_SIZE - offset;

      target = (uint8_t*)system_ram + offset;
   } else if (channel.target >= ROM_BASE && channel.target < ROM_BASE + ROM_SIZE) {
      const int offset = channel.target - ROM_BASE;
      const int max_length = ROM_SIZE - offset;

      if (length > max_length) {
         channel.flags.active = 0;
         channel.flags.exception = 1;
         length = max_length;
      }

      channel.length        -= (length % copy_length) / word_width;
      channel.flags.repeats -= length / copy_length;

      if (channel.flags.repeats == 0) {
         channel.flags.active = 0;
      }

      return ;
   } else {
      return ;
   }

   while (length >= copy_length && channel.flags.repeats > 0) {
      memcpy(target, source, copy_length);
      target += copy_length;
      length -= copy_length;

      if (--channel.flags.repeats == 0) {
         channel.length = 0;
         channel.flags.active = 0;
         return ;
      }
   }

   if (length > 0) {
      memcpy(target, source, length);
      channel.length -= length / word_width;
   }
}

void dma_write(uint32_t address, uint32_t value, uint32_t mask) {
   const int page = (address & 0xFFFFC) >> 2;

   // Out of bounds
   if (page >= WORD_LENGTH) {
      return ;
   }

   raw_shadow[page] = raw[page] = (raw[page] & ~mask) | (value & mask);

   // Not a control register
   DMAChannel& channel = channels[(page >> 2) % MAX_CHANNELS];

   if (page & 0x3 || !channel.flags.active) return ;

   if (channel.flags.repeats == 0) {
      channel.flags.active = false;
      return ;
   }

   active = true;
   fast_dma(channel);
   dma_advance();
}
