typedef unsigned int size_t;

typedef unsigned int uint32_t;
typedef unsigned short uint16_t;
typedef unsigned char uint8_t;

typedef signed int int32_t;
typedef signed short int16_t;
typedef signed char int8_t;

#include "system.h"

volatile uint32_t DATA[] = {
	0xDEADFACE,
	0xCAFEBABE,
	0x01234567
};

volatile uint32_t fifo_read[32];

void* memcpy(void* dst, const void* src, size_t n) {
	uint32_t source = (uint32_t)src;
	uint32_t target = (uint32_t)dst;

	if ((3 & source) == (target & 3)) {
		while (source & 3) {
			if (n-- <= 0) return dst;
			*(uint8_t*)(target++) = *(const uint8_t*)(source++);
		}

		DMA_Channels[0].source = (uint32_t) source;
		DMA_Channels[0].target = (uint32_t) target;
		DMA_Channels[0].length = n / 4;
		DMA_Channels[0].flags = 0
			| DMA_TRIGGER_NONE 
			| DMA_WIDTH_BIT32 
			| DMACR_ACTIVE_MASK 
			| (4 << DMACR_SSTRIDE_POS)
			| (4 << DMACR_TSTRIDE_POS)
			;

		source += n & ~3;
		target += n & ~3;
		n &= 3;
	} else if ((source & 1) ^ (target & 1)) {
		while (source & 1) {
			if (n-- <= 0) return dst;
			*(uint8_t*)(target++) = *(const uint8_t*)(source++);
		}

		DMA_Channels[0].source = (uint32_t) source;
		DMA_Channels[0].target = (uint32_t) target;
		DMA_Channels[0].length = n / 2;
		DMA_Channels[0].flags = 0
			| DMA_TRIGGER_NONE 
			| DMA_WIDTH_BIT16
			| DMACR_ACTIVE_MASK 
			| (2 << DMACR_SSTRIDE_POS)
			| (2 << DMACR_TSTRIDE_POS)
			;
		source += n & ~1;
		target += n & ~1;
		n &= 1;
	} else {
		DMA_Channels[0].source = (uint32_t) source;
		DMA_Channels[0].target = (uint32_t) target;
		DMA_Channels[0].length = n;
		DMA_Channels[0].flags = 0
			| DMA_TRIGGER_NONE 
			| DMA_WIDTH_BIT8
			| DMACR_ACTIVE_MASK 
			| (1 << DMACR_SSTRIDE_POS)
			| (1 << DMACR_TSTRIDE_POS)
			;
		
		n = 0;
	}

	while (n-- > 0) {
		*(uint8_t*)(target++) = *(const uint8_t*)(source++);
	}

	while (DMA_Channels[0].flags & DMACR_ACTIVE_MASK) ;

	return dst;
}

static const uint32_t GPU_TEST[] = {
	GPU_VIEWSTART(0, 0),
	GPU_CLIPPOS(0, 0),
	GPU_CLIPSIZE(256, 240),
	GPU_DRAWCONFIG(GPU_DRAWCONFIG_0_50_POS_0_50, GPU_DRAWCONFIG_0_50_POS_0_50) 
		| GPU_DRAWCONFIG_DITHER 
		| GPU_DRAWCONFIG_BLEND_SET,
	GPU_CLUT(GPU_CLUT_DISABLED, 0, 0),

	GPU_COMMAND_QUAD | GPU_DRAW_SHADED | 
	GPU_COLOR(   0,    0, 0xFF), GPU_POINT(  0,   0),
	GPU_COLOR(   0, 0xFF,    0), GPU_POINT(  0, 240),
	GPU_COLOR(0xFF, 0xFF, 0xFF), GPU_POINT(256,   0),
	GPU_COLOR(0xFF,    0,    0), GPU_POINT(256, 240),

	GPU_TEXSIZE(0, 0, 0, 0),
	GPU_TEXPOS(0, 0),
	GPU_SETDATA(0, 0, 1, 4),
	0x76543210,
	0xFEDCBA98,

	GPU_CLUT(GPU_CLUT_4BPP, 0, 220),
	GPU_SETDATA(0, 220, 16, 1),
	0x00028000,
	0x00068004,
	0x800A0008,
	0x800E000C,
	0x00128010,
	0x00168014,
	0x801A0018,
	0x801E001C,

	GPU_COMMAND_QUAD | GPU_DRAW_TEXTURED | GPU_DRAW_BLENDED | GPU_COLOR(0xFF,0xFF,0xFF),
	GPU_POINT( 64,  64), GPU_POINT(0, 0),
	GPU_POINT(192,  64), GPU_POINT(4, 0),
	GPU_POINT( 64, 192), GPU_POINT(0, 4),
	GPU_POINT(192, 192), GPU_POINT(4, 4),

	GPU_COMMAND_POINT | GPU_COLOR(0xFF,0,0xFF),
	GPU_POINT(96,  96),

	GPU_COMMAND_POINT | GPU_COLOR(0xFF,0,0xFF),
	GPU_POINT(96, 160),

	GPU_COMMAND_POINT | GPU_COLOR(0xFF,0,0xFF),
	GPU_POINT(160,  96),

	GPU_COMMAND_POINT | GPU_COLOR(0xFF,0,0xFF),
	GPU_POINT(160, 160),

	GPU_COMMAND_LINE | GPU_DRAW_POLY | GPU_COLOR(0xFF,0xFF,0x0),
	GPU_POINT(128,  48),
	GPU_POINT(192, 112),
	GPU_POINT(128, 176),
	GPU_POINT( 64, 112),
	GPU_POINT(128,  48),
	0xFFFFFFFF,

	GPU_GETDATA(0, 0, 1, 4)
};

int main(void) {
	DMA_Channels[1].source = (uint32_t) &GPU_TEST;
	DMA_Channels[1].target = (uint32_t) &GPU_Registers->fifo;
	DMA_Channels[1].length = sizeof(GPU_TEST) / sizeof(GPU_TEST[0]);
	DMA_Channels[1].flags = 0
		| DMA_TRIGGER_GPU_RX_FIFO
		| DMA_WIDTH_BIT32
		| DMACR_ACTIVE_MASK 
		| (4 << DMACR_SSTRIDE_POS)
		| (4 << DMACR_TSTRIDE_POS)
		;

	for (int i = 0; i < 8; i++) {
		fifo_read[i] = GPU_Registers->fifo;
	}
}
