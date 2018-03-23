#pragma once

#include <stdint.h>
#include "compiler.h"

static const uint32_t PROCESSOR_ID = 0x00000301;

static const uint32_t STATUS_CU3 = 0x80000000;
static const uint32_t STATUS_CU2 = 0x40000000;
static const uint32_t STATUS_CU1 = 0x20000000;
static const uint32_t STATUS_CU0 = 0x10000000;

static const uint32_t STATUS_RE	 = 0x02000000;	// Unsupported

static const uint32_t STATUS_BEV = 0x00400000;
static const uint32_t STATUS_TS	 = 0x00200000;	// Unlikely to be supported
static const uint32_t STATUS_PE	 = 0x00100000;	// Unsupported
static const uint32_t STATUS_CM	 = 0x00080000;	// Unsupported
static const uint32_t STATUS_PZ	 = 0x00040000;	// Unsupported
static const uint32_t STATUS_SwC = 0x00020000;	// Unsupported
static const uint32_t STATUS_IsC = 0x00010000;	// Unsupported

static const uint32_t STATUS_IM	 = 0x0000FF00;

static const uint32_t STATUS_KUo = 0x00000020;
static const uint32_t STATUS_IEo = 0x00000010;
static const uint32_t STATUS_KUp = 0x00000008;
static const uint32_t STATUS_IEp = 0x00000004;
static const uint32_t STATUS_KUc = 0x00000002;
static const uint32_t STATUS_IEc = 0x00000001;

static const uint32_t ALL_STATUS_BITS =
	STATUS_CU3 | STATUS_CU2 | STATUS_CU1 | STATUS_CU0 |
	STATUS_BEV | STATUS_IM |
	STATUS_KUo | STATUS_IEo | STATUS_KUp | STATUS_IEp | STATUS_KUc | STATUS_IEc;

static const uint32_t TLB_PAGES = 64;

EXPORT uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed);
EXPORT void trap(int exception, int address, int delayed, int coprocessor);
void handle_interrupt();
void bus_fault(int ex, uint32_t address, uint32_t pc, uint32_t delayed);
uint32_t lookup(uint32_t address, bool write, bool& exception);

namespace COP0 {
	void reset();
}
