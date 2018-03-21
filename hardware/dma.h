#pragma once

#define MAX_DMA_CHANNELS   8

enum {
   DMA_TRIGGER_NONE         = 0x0,
   DMA_TRIGGER_DMA0         = 0x1,
   DMA_TRIGGER_DMA1         = 0x2,
   DMA_TRIGGER_DMA2         = 0x3,
   DMA_TRIGGER_DMA3         = 0x4,
   DMA_TRIGGER_DMA4         = 0x5,
   DMA_TRIGGER_DMA5         = 0x6,
   DMA_TRIGGER_DMA6         = 0x7,
   DMA_TRIGGER_DMA7         = 0x8,
   DMA_TRIGGER_GPU_TX_FIFO  = 0x9,
   DMA_TRIGGER_GPU_RX_FIFO  = 0xA,
   DMA_TRIGGER_DSP_IDLE     = 0xB,
   DMA_TRIGGER_DSP_FINISHED = 0xC
};

enum {
   DMA_WIDTH_BIT8  = 0x0010,
   DMA_WIDTH_BIT16 = 0x0020,
   DMA_WIDTH_BIT32 = 0x0000
};

#define DMACR_ACTIVE_MASK     0x8000
#define DMACR_EXCEPTION_MASK  0x4000
#define DMACR_TRIGGER_MASK    0x000F
#define DMACR_WIDTH_MASK      0x0030

typedef struct {
   uint32_t source;
   uint32_t target;
   uint32_t length;
   uint32_t repeats;
   
   uint16_t flags;
   int8_t   source_stride;
   int8_t   target_stride;
} DMAChannel;

static DMAChannel* const DMA_Channels = (DMAChannel*) DMA_BASE;
