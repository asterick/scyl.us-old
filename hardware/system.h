#pragma once

#define RAM_BASE 						0x00000000
#define ROM_BASE 						0x1FC00000

#define RAM_SIZE 						0x00400000 // 4MB
#define ROM_SIZE 						0x00080000 // 512KB

#define DMA_BASE    					0x1F000000
#define TIMER_BASE 						0x1F100000
#define CEDAR_BASE 						0x1F200000
#define GPU_BASE 						0x1F300000
#define DSP_BASE 						0x1F400000
#define SPU_BASE 						0x1F500000

#define KERNEL_UNMAPPED 				0xC0000000	// Not cached

#define RESET_VECTOR 					0xFFC00000
#define TLB_EXCEPTION_VECTOR			0xFFC00100
#define EXCEPTION_VECTOR				0xFFC00180

#define REMAPPED_TLB_EXCEPTION_VECTOR	0x80000000
#define REMAPPED_EXCEPTION_VECTOR		0x80000080

enum SystemIRQ {
	SWI0_IRQn,
	SWI1_IRQn,
	DMA_IRQn,
	GPU_IRQn
};

#include "dma.h"
#include "gpu.h"
