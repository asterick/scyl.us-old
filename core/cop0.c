#include "types.h"
#include "fields.h"
#include "consts.h"
#include "cop0.h"

#include "imports.h"

#include "registers.h"
#include "hash.h"

uint32_t tlb_lo[TLB_PAGES];
uint32_t tlb_hi[TLB_PAGES];

static uint32_t status;
static uint32_t index;
static uint32_t entry_hi;
static uint32_t entry_lo;

static uint32_t cause;
static uint32_t epc;
static uint32_t bad_addr;
static uint32_t pt_base;

void reset_cop0() {
	status = STATUS_KUc | STATUS_BEV;
	cause = 0;

	reset_hash();
}

uint32_t random() {
	static uint32_t inc = 0x8;

	if (++inc >= 0x40) inc = 0x8;

	return inc;
}

int cop_enabled(int cop) {
	return (((status >> 18) | ((status & STATUS_KUc) ? 1 : 0)) >> cop) & 1;
}

void interrupt(int i) {
	status |= (1 << (i + 8)) & STATUS_IM;
}

void handle_interrupt() {
	if ((status & STATUS_IEc) && (cause & status & STATUS_IM)) {
		trap(EXCEPTION_INTERRUPT, registers.pc, 0, 0);
	}
}

uint32_t read_tlb(uint32_t hash) {
	uint32_t regular = find_hash(hash & ~0x03F);

	if (regular & 0x200) {
		return regular;
	}

	return find_hash(hash | 0xFFF);
}

static void write_tlb(int index) {
	// Ignore TLB entries that can cause a collision (normally would cause a system reset)
	if (read_tlb(entry_hi) & 0x200) {
		return ;
	}

	// Clear out previous TLB element (if it was valid)
	if (tlb_lo[index] & 0x200) {
		uint32_t indexWas = tlb_hi[index] | ((tlb_lo[index] & 0x100) ? 0xFFF : 0);
		clear_hash(indexWas);
	}

	// Setup our fast lookup
	if (entry_lo & 0x200) {
		uint32_t indexIs = entry_hi | ((entry_lo & 0x100) ? 0xFFF : 0);
		write_hash(indexIs, entry_lo | index);
	}

	// Store our TLB (does not handle global)
	tlb_lo[index] = entry_lo;
	tlb_hi[index] = entry_hi;
}

uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed) {
	// let cached = true;
	if (address & 0x8000000 && ~status & STATUS_KUc) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	// Check if line is cached (does nothing)
	if ((address & 0xE0000000) == 0xA0000000) {
		// cached = false;
	}

	if ((address & 0xC0000000) != 0x80000000) {
		uint32_t page = address & 0xFFFFF000;
		uint32_t result = read_tlb(page | (entry_hi & 0xFFF));

		// cached = ~result & 0x0800;

		// TLB line is inactive
		if (~result & 0x0200) {
			bad_addr = address;
			entry_hi = (entry_hi & ~0xFFFFF000) | (address & 0xFFFFF000);
			exception(write ? EXCEPTION_TLBSTORE : EXCEPTION_TLBLOAD, address, delayed, 0);
		}

		// Writes are not permitted
		if (write && ~result & 0x0400) {
			bad_addr = address;
			entry_hi = (entry_hi & ~0xFFFFF000) | (address & 0xFFFFF000);
			exception(EXCEPTION_TLBMOD, address, delayed, 0);
		}

		return (result & 0xFFFFF000) | (address & 0x00000FFF);
	} else {
		return address & 0x1FFFFFFC;
	}
}

void trap(int exception, int address, int delayed, int coprocessor) {
	registers.clocks -= (address - registers.start_pc + 4) >> 2;

	// Preserve return address
	epc = address;

	// Enter kernal mode, and shift the mode flags
	status = (status & ~ 0x3F) | ((status << 2) & 0x3C) | STATUS_KUc;

	// Set our cause register
	cause = (cause & 0x0000FF00) |
		(delayed ? 0x80000000 : 0) |
		(coprocessor << 28) |
		(exception << 2);

	switch (exception) {
	case EXCEPTION_TLBLOAD:
	case EXCEPTION_TLBSTORE:
		registers.pc = (status & STATUS_BEV) ? 0xbfc00100 : 0x80000000;
		break ;

	default:
		registers.pc = (status & STATUS_BEV) ? 0xbfc00180 : 0x80000080;
		break ;
	}
}

// ******
// ** Co-Processor Move registers
// ******

void MFC0(uint32_t address, uint32_t word, uint32_t delayed) {
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
	case 0x0: // c0_index
		value = index;
		break ;
	case 0x1: // c0_random (non-deterministic, cheap method)
		value = random() << 8;
		break ;
	case 0x2: // c0_entrylo
		value = entry_lo;
		break ;
	case 0xA: // c0_entryhi
		value = entry_hi;
		break ;
	case 0x4: // c0_context
		value = pt_base | ((bad_addr & 0xFFFFF800) >> 11);
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

void MTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t value = read_reg(FIELD_RT(word));

	switch (FIELD_RD(word)) {
	// Virtual-memory registers
	case 0x0: // c0_index
		index = value & 0x3F00;
		break ;
	case 0x2: // c0_entrylo
		entry_lo = value & 0xFFFFFFC0;
		break ;
	case 0xA: // c0_entryhi
		entry_hi = value & 0xFFFFFF00;
		break ;
	case 0x4: // c0_context
		pt_base = value & 0xFFE00000;
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

void RFE(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	status = (status & ~0xF) | ((status >> 2) & 0xF);
}

void TLBR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	entry_lo = tlb_lo[(index >> 8) & 0x3F];
	entry_hi = tlb_hi[(index >> 8) & 0x3F];
}

void TLBWI(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb((index >> 8) & 0x3F);
}

void TLBWR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb(random());
}

void TLBP(uint32_t address, uint32_t word, uint32_t delayed) {
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

// ***********
// ** Unused move instructions
// ***********
void CFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void CTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void LWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void SWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}
