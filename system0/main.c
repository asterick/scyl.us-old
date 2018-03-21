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

void* memcpy(void* dest, const void* src, size_t n) {
	DMA_Channels[0].source = (uint32_t) src;
	DMA_Channels[0].target = (uint32_t) dest;
	DMA_Channels[0].length = n / 2;
	DMA_Channels[0].repeats = 1;
	DMA_Channels[0].flags = 0
		| DMA_TRIGGER_NONE 
		| DMA_WIDTH_BIT32 
		| DMACR_ACTIVE_MASK 
		| (4 << DMACR_SSTRIDE_POS)
		| (4 << DMACR_TSTRIDE_POS)
		;

	while (DMA_Channels[0].flags & DMACR_ACTIVE_MASK) ;

	return dest;
}

int main(void) {
	// TODO
}
