#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"
#include "cop0.h"

#include "imports.h"
#include "memory.h"

#include "registers.h"
#include "system.h"

uint32_t COP0::status;

uint32_t COP0::cause;
uint32_t COP0::epc;
uint32_t COP0::bad_addr;

uint32_t COP0::index;
uint32_t COP0::page_table_addr;
uint32_t COP0::process_state;

using namespace COP0;

void COP0::reset() {
	status = STATUS_KUc | STATUS_BEV;
	cause = 0;
}

static inline uint32_t random() {
	static uint32_t inc = 0x8;

	if (++inc >= 0x40) inc = 0x8;

	return inc;
}

int cop_enabled(int cop) {
	return (((status >> 18) | ((status & STATUS_KUc) ? 1 : 0)) >> cop) & 1;
}

void COP0::interrupt(SystemIRQ i) {
	status |= (1 << (i + 8)) & STATUS_IM;
}

void COP0::handle_interrupt() {
	if ((status & STATUS_IEc) && (cause & status & STATUS_IM)) {
		trap(EXCEPTION_INTERRUPT, registers.pc, 0, 0);
	}
}

uint32_t COP0::translate(uint32_t address, uint32_t write, SystemException& problem) {
	bool translated = (address & 0xC0000000) != 0xC0000000;
	bool is_kernel = status & STATUS_KUc;

	if (problem != EXCEPTION_NONE) return ~0;

	// Early supervisor test
	if ((address & 0x80000000) && !is_kernel) {
		problem = EXCEPTION_COPROCESSORUNUSABLE;
		return ~0;
	}

	// Is address translated
	if (translated) {
		if (!cop_enabled(0)) {
			problem = EXCEPTION_COPROCESSORUNUSABLE;
			return ~0;
		}

		uint32_t page_ptr = page_table_addr;
		int bits = 32;

		for (;;) {
			// Current page is supervisor only
			if ((page_ptr & PAGETABLE_KERNAL_MASK) && !is_kernel) {
				problem = EXCEPTION_COPROCESSORUNUSABLE;
				return ~0;
			}

			// Write only page
			if ((page_ptr & PAGETABLE_RO_MASK) && write) {
				problem = EXCEPTION_TLBMOD;
				return ~0;
			}

			// Not a global page (or TBL global disabled)
			if (PAGETABLE_GLOBAL_MASK & ~(page_ptr | process_state)) {
				if ((PAGETABLE_PID_MASK & process_state) != (PAGETABLE_PID_MASK & page_ptr)) {
					problem = write ? EXCEPTION_TLBSTORE : EXCEPTION_TLBLOAD;
				}
			}

			int length = (page_ptr & PAGETABLE_LEN_MASK) * 8;

			if (length == 0) {
				uint32_t mask = ~0 >> bits;

				return (address & mask & 0xFFFFFFFC) | (page_ptr & ~mask);
			}

			bits -= length;

			// Page table grainularity fault
			if (bits < 12) {
				problem = EXCEPTION_TLBFAILURE;
			}

			int index = (address >> bits) & ((1 << length) - 1);
			int address = (page_ptr & PAGETABLE_ADDR_MASK) + (index * 4);

			// Chain page table lookups
			page_ptr = Memory::read(address, false, problem);

			if (problem != EXCEPTION_NONE) {
				problem = EXCEPTION_TLBFAILURE;
				return ~0;
			}
		}
	}
	
	// Unmapped through TLB
	return address & 0x1FFFFFFC;
}

EXPORT uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed) {
	SystemException problem = EXCEPTION_NONE;
	uint32_t target = COP0::translate(address, write, problem);

	switch(problem) {
		case EXCEPTION_TLBSTORE:
		case EXCEPTION_TLBLOAD:
		case EXCEPTION_TLBMOD:
		case EXCEPTION_TLBFAILURE:
			bad_addr = address;
		default:
			exception(problem, pc, delayed, 0);
		case EXCEPTION_NONE:
			return target;
	}
}

EXPORT void trap(int exception, int address, int delayed, int coprocessor) {
	// Preserve return address
	epc = address;

	// Enter kernal mode, and shift the mode flags
	status = (status & ~0x3F) | ((status << 2) & 0x3C) | STATUS_KUc;

	// Set our cause register
	cause = (cause & 0x0000FF00) |
		(delayed ? 0x80000000 : 0) |
		(coprocessor << 28) |
		(exception << 2);

	switch (exception) {
	case EXCEPTION_TLBLOAD:
	case EXCEPTION_TLBSTORE:
		registers.pc = (status & STATUS_BEV) ? TLB_EXCEPTION_VECTOR : REMAPPED_TLB_EXCEPTION_VECTOR;
		break ;

	default:
		registers.pc = (status & STATUS_BEV) ? EXCEPTION_VECTOR : REMAPPED_EXCEPTION_VECTOR;
		break ;
	}
}

// ******
// ** Co-Processor Move registers
// ******

EXPORT void MFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t value;

	switch (FIELD_RD(word)) {
	// Random registers
	case 0xF: // c0_prid
		value = PROCESSOR_ID;
		break ;

	// Virtual-memory registers
	case 0x0: //
		value = index;
		break ;
	case 0x1: // c0_random (non-deterministic, cheap method)
		value = random() << 8;
		break ;
	case 0x2:
		value = page_table_addr;
		break ;
	case 0x3:
		value = process_state;
		break ;
	case 0x8: // c0_vaddr
		value = bad_addr;
		break ;

	// Status/Exception registers
	case 0xC: // c0_status
		value = status;
		break ;
	case 0xD: // c0_cause
		value = cause;
		break ;
	case 0xE: // c0_epc
		value = epc;
		break ;
	default:
		value = 0;
		break ;
	}

	write_reg(FIELD_RT(word), value);
}

EXPORT void MTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t value = read_reg(FIELD_RT(word));

	switch (FIELD_RD(word)) {
	// Virtual address registers
	case 0x0:
		page_table_addr = value;
		break ;
	case 0x2:
		process_state = value & (PAGETABLE_GLOBAL_MASK | PAGETABLE_PID_MASK);
		break ;

	// Status/Exception registers
	case 0xC: // c0_status
		status = value & ALL_STATUS_BITS;
		break ;
	case 0xD: // c0_cause
		cause = (cause & ~0x0000FF00) | (value & 0x0000FF00);
		break ;
	}
}

// ******
// ** Co-Processor instructions
// ******

EXPORT void RFE(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	status = (status & ~0xF) | ((status >> 2) & 0xF);
}

// ***********
// ** Unused move instructions
// ***********
EXPORT void CFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

EXPORT void CTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

EXPORT void LWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

EXPORT void SWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}
