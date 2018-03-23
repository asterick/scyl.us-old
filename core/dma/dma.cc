#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "system.h"

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "dma.h"
#include "cop0.h"
#include "memory.h"
#include "registers.h"
#include "memory.h"

#define WORD_LENGTH (sizeof(channels) / sizeof(uint32_t))

static union {
   DMAChannel channels[MAX_DMA_CHANNELS];
   uint32_t raw[WORD_LENGTH];
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
   case DMA_TRIGGER_NONE: return true;
   case DMA_TRIGGER_DMA0: return (channels[0].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA1: return (channels[1].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA2: return (channels[2].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA3: return (channels[3].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA4: return (channels[4].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA5: return (channels[5].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA6: return (channels[6].flags & DMACR_ACTIVE_MASK) == 0;
   case DMA_TRIGGER_DMA7: return (channels[7].flags & DMACR_ACTIVE_MASK) == 0;

   // Unimplemented (currently locks the channel)
   case DMA_TRIGGER_GPU_TX_FIFO:
   case DMA_TRIGGER_GPU_RX_FIFO:
   case DMA_TRIGGER_DSP_IDLE:
   case DMA_TRIGGER_DSP_FINISHED:
   default:
      return false;
   }
}

static inline void chain(DMAChannel& channel) {
   if (~channel.flags & DMACR_CHAIN_MASK) {
      channel.flags &= ~DMACR_ACTIVE_MASK;
      return ;
   }

   registers.clocks -= 2;

   uint32_t address;
   bool exception = false;

   uint32_t source_addr = lookup(channel.source, false, exception);
   uint32_t length_addr = lookup(channel.length + 4, false, exception);
   channel.source = Memory::read(source_addr, exception);
   channel.length = Memory::read(length_addr, exception);

   if (channel.length == 0 || exception) {
      channel.flags &= ~DMACR_ACTIVE_MASK;
      return ;
   }
}

static inline bool fast_dma(DMAChannel& channel) {
   int word_width;

   // Verify alignment and stride
   switch (channel.flags & DMACR_WIDTH_MASK) {
      case DMA_WIDTH_BIT8:
         if ((channel.flags & DMACR_SSTRIDE_MASK) >> DMACR_SSTRIDE_POS != 1 || (channel.flags & DMACR_TSTRIDE_MASK) >> DMACR_TSTRIDE_POS != 1) return false;
         word_width = 1;
         break ;
      case DMA_WIDTH_BIT16:
         if ((channel.flags & DMACR_SSTRIDE_MASK) >> DMACR_SSTRIDE_POS != 2 || (channel.flags & DMACR_TSTRIDE_MASK) >> DMACR_TSTRIDE_POS != 2) return false;
         if ((channel.source | channel.target) & 1) return false;
         
         word_width = 2;
         break ;
      case DMA_WIDTH_BIT32:
         if ((channel.flags & DMACR_SSTRIDE_MASK) >> DMACR_SSTRIDE_POS != 4 || (channel.flags & DMACR_TSTRIDE_MASK) >> DMACR_TSTRIDE_POS != 4) return false;
         if ((channel.source | channel.target) & 3) return false;

         word_width = 4;
         break ;
      default:
         return false;
   }

   int length = channel.length * word_width;

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
      return false;
   }

   // Determine if target is in ram
   if (channel.target >= RAM_BASE && channel.target < RAM_BASE + RAM_SIZE) {
      const int offset = channel.target - RAM_BASE;
      const int max_length = RAM_SIZE - offset;

      target = (uint8_t*)system_ram + offset;

      if (length > max_length) length = max_length;
   } else if (channel.target >= ROM_BASE && channel.target < ROM_BASE + ROM_SIZE) {
      const int offset = channel.target - ROM_BASE;
      const int max_length = ROM_SIZE - offset;
      if (length > max_length) length = max_length;

      channel.length  -= length;
      registers.clocks -= (length / word_width) * 2;

      return false;
   } else {
      return false;
   }

   while (length > 0) {
      registers.clocks -= length * 2;
      memcpy(target, source, length);
   }

   channel.length -= length / word_width;
   if (channel.length == 0) {
      // Reset source address
      chain(channel);
   }

   return false;
}

void DMA::advance() {
   if (!active) return ;

   active = false;
   for (int i = 0; i < MAX_DMA_CHANNELS; i++) {
      DMAChannel& channel = channels[i];

      if (~channel.flags & DMACR_ACTIVE_MASK) continue ;

      active = true;
      if (!fast_dma(channel)) continue ;

      bool exception = false;
      while (check_trigger(channel.flags & DMACR_TRIGGER_MASK)) {
         uint32_t source = lookup(channel.source, false, exception);
         uint32_t value = Memory::read(source, exception);
         uint32_t target = lookup(channel.target, true, exception);

         value = adjust((target & 3) - (source & 3), value);
         registers.clocks -= 2; // No cross bar

         switch (channel.flags & DMACR_WIDTH_MASK) {
            case DMA_WIDTH_BIT8:
               Memory::write(target, value, 0xFF << ((target & 3) * 8), exception);

               break ;
            case DMA_WIDTH_BIT16:
               Memory::write(target, value, (target & 2) ? 0xFFFF0000 : 0x0000FFFF, exception);
               break ;
            case DMA_WIDTH_BIT32:
               Memory::write(target, value, 0xFFFFFFFF, exception);
               break ;
            default:
               exception = true;
               break ;
         }

         if (exception) {
            channel.flags |= DMACR_EXCEPTION_MASK;
            channel.flags &= ~DMACR_ACTIVE_MASK;
            break ;
         }

         channel.source += (channel.flags & DMACR_SSTRIDE_MASK) >> DMACR_SSTRIDE_POS;
         channel.target += (channel.flags & DMACR_TSTRIDE_MASK) >> DMACR_TSTRIDE_POS;

         // The system is no longer active
         if (--channel.length == 0) {
            // Reset source address
            chain(channel);
         }
      }
   }
}

uint32_t DMA::read(uint32_t address) {
   const int page = (address - DMA_BASE) >> 2;

   // Out of bounds
   if (page >= WORD_LENGTH) {
      return ~0;
   }

   uint32_t* const raw = (uint32_t*)&channels;

   return raw[page];
}

void DMA::write(uint32_t address, uint32_t value, uint32_t mask) {
   const uint32_t page = address - DMA_BASE;
   const uint32_t word_address = page / sizeof(uint32_t);

   // Out of bounds
   if (page >= sizeof(channels)) {
      return ;
   }

   raw[word_address] = value;

   // Test if we are writting to a control register
   DMAChannel& channel = channels[page / sizeof(DMAChannel)];

   const uint32_t* a = &raw[word_address];
   const uint32_t* b = &channel.flags;

   if (a != b) { return ; }

   if (channel.length == 0) {
      chain(channel);
      return ;
   }

   active = true;
   advance();
}
