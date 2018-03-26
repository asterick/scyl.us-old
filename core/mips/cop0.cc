#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"
#include "cop0.h"

#include "imports.h"
#include "memory.h"

#include "registers.h"
#include "system.h"

static uint32_t status;

static uint32_t cause;
static uint32_t epc;
static uint32_t bad_addr;

static uint32_t page_table_addr;
static uint32_t process_state;

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

void COP0::bus_fault(int ex, uint32_t address, uint32_t pc, uint32_t delayed) {
	bad_addr = address;
	exception(ex, pc, delayed, 0);
}

uint32_t COP0::lookup(uint32_t address, bool write, bool& failure) {
	bool translated = (address & 0xC0000000) != 0xC0000000;
	bool is_kernel = status & STATUS_KUc;

	// Early supervisor test
	if ((address & 0x80000000) && !is_kernel) {
		failure = true;
		return ~0;
	}

	// Is address translated
	if (translated) {
		if (!cop_enabled(0)) {
			failure = true;
			return ~0;
		}

		uint32_t page_ptr = page_table_addr;
		int bits = 32;

		for (;;) {
			// Current page is supervisor only
			if ((page_ptr & PAGETABLE_KERNAL_MASK) && !is_kernel) {
				failure = true;
				return ~0;
			}

			// Write only page
			if ((page_ptr & PAGETABLE_RO_MASK) && write) {
				failure = true;
				return ~0;
			}

			// Not a global page (or TBL global disabled)
			if (PAGETABLE_GLOBAL_MASK & ~(page_ptr | process_state)) {
				if ((PAGETABLE_PID_MASK & process_state) != (PAGETABLE_PID_MASK & page_ptr)) {
					failure = true;
					return ~0;
				}
			}

			int length = (page_ptr & PAGETABLE_LEN_MASK) * 8;

			if (length == 0) {
				uint32_t mask = ~0 >> bits;
				return (address & mask) | (page_ptr & ~mask);
			}

			bits -= length;

			// Page table grainularity fault
			if (bits < 12) {
				failure = true;
				return ~0;
			}

			int index = (address >> bits) & ((1 << length) - 1);

			// Chain page table lookups (with a double fault check)
			page_ptr = Memory::read((page_ptr & PAGETABLE_ADDR_MASK) + (index * 4), failure);

			if (failure) return ~0;
		} 
	}
	
	// Unmapped through TLB
	return address & 0x1FFFFFFF;
}

EXPORT uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed) {
	bool translated = (address & 0xC0000000) != 0xC0000000;
	bool is_kernel = status & STATUS_KUc;

	// Early supervisor test
	if ((address & 0x80000000) && !is_kernel) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, pc, delayed);
	}

	// Is address translated
	if (translated) {
		if (!cop_enabled(0)) {
			exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
		}

		uint32_t page_ptr = page_table_addr;
		int bits = 32;

		for (;;) {
			// Current page is supervisor only
			if ((page_ptr & PAGETABLE_KERNAL_MASK) && !is_kernel) {
				exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);			
			}

			// Write only page
			if ((page_ptr & PAGETABLE_RO_MASK) && write) {
				COP0::bus_fault(EXCEPTION_TLBMOD, address, pc, delayed);
			}

			// Not a global page (or TBL global disabled)
			if (PAGETABLE_GLOBAL_MASK & ~(page_ptr | process_state)) {
				if ((PAGETABLE_PID_MASK & process_state) != (PAGETABLE_PID_MASK & page_ptr)) {
					COP0::bus_fault(write ? EXCEPTION_TLBSTORE : EXCEPTION_TLBLOAD, address, pc, delayed);	
				}
			}

			int length = (page_ptr & PAGETABLE_LEN_MASK) * 8;

			if (length == 0) {
				uint32_t mask = ~0 >> bits;
				return (address & mask) | (page_ptr & ~mask);
			}

			bits -= length;

			// Page table grainularity fault
			if (bits < 12) {
				COP0::bus_fault(write ? EXCEPTION_TLBSTORE : EXCEPTION_TLBLOAD, address, pc, delayed);
			}

			int index = (address >> bits) & ((1 << length) - 1);

			// Chain page table lookups (with a double fault check)
			bool exception = false;
			page_ptr = Memory::read((page_ptr & PAGETABLE_ADDR_MASK) + (index * 4), exception);

			if (exception) {
				COP0::bus_fault(EXCEPTION_DOUBLEFAULT, address, pc, delayed);
			}
		} 
	}
	
	// Unmapped through TLB
	return address & 0x1FFFFFFF;
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
	case 0x0:
		value = page_table_addr;
		break ;
	case 0x1: // c0_random (non-deterministic, cheap method)
		value = random() << 8;
		break ;
	case 0x2:
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

/*
EXPORT void TLBR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	entry_lo = tlb_lo[(index >> 8) & 0x3F];
	entry_hi = tlb_hi[(index >> 8) & 0x3F];
}

EXPORT void TLBWI(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb((index >> 8) & 0x3F);
}

EXPORT void TLBWR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb(random());
}

EXPORT void TLBP(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t found = read_tlb(entry_hi);

	if (found & 0x200) {
		index = (found & 0x3F) << 8;
	} else {
		index |= 0x80000000;
	}
}
*/

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
