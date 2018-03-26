#pragma once

#include <stdint.h>
#include "compiler.h"
#include "system.h"

static const uint32_t PROCESSOR_ID = 0x00000301;

static const uint32_t STATUS_CU3 = 0x80000000;
static const uint32_t STATUS_CU2 = 0x40000000;
static const uint32_t STATUS_CU1 = 0x20000000;
static const uint32_t STATUS_CU0 = 0x10000000;

static const uint32_t STATUS_BEV = 0x00400000;

static const uint32_t STATUS_IM	 = 0x0000FF00;

static const uint32_t STATUS_KUo = 0x00000020;
static const uint32_t STATUS_IEo = 0x00000010;
static const uint32_t STATUS_KUp = 0x00000008;
static const uint32_t STATUS_IEp = 0x00000004;
static const uint32_t STATUS_KUc = 0x00000002;
static const uint32_t STATUS_IEc = 0x00000001;

static const uint32_t PAGETABLE_ADDR_MASK    = 0xFFFFF000;
static const uint32_t PAGETABLE_KERNAL_MASK  = 0x00000800;
static const uint32_t PAGETABLE_CACHE_MASK   = 0x00000400;
static const uint32_t PAGETABLE_RO_MASK	     = 0x00000200;
static const uint32_t PAGETABLE_GLOBAL_MASK  = 0x00000100;
static const uint32_t PAGETABLE_PID_MASK 	 = 0x000000FC;
static const uint32_t PAGETABLE_LEN_MASK	 = 0x00000003;

static const uint32_t ALL_STATUS_BITS =
	STATUS_CU3 | STATUS_CU2 | STATUS_CU1 | STATUS_CU0 |
	STATUS_BEV | STATUS_IM |
	STATUS_KUo | STATUS_IEo | STATUS_KUp | STATUS_IEp | STATUS_KUc | STATUS_IEc;

EXPORT uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed);
EXPORT void trap(int exception, int address, int delayed, int coprocessor);

namespace COP0 {
	void reset();
	void handle_interrupt();
	void bus_fault(int ex, uint32_t address, uint32_t pc, uint32_t delayed);
	uint32_t lookup(uint32_t address, bool write, bool& exception);
	void interrupt(SystemIRQ i);
}
