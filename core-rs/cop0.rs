use imports;
use hash;
use exceptions;

const PROCESSOR_ID: u32 = 0x00000301;

const STATUS_CU3: u32 = 0x80000000;
const STATUS_CU2: u32 = 0x40000000;
const STATUS_CU1: u32 = 0x20000000;
const STATUS_CU0: u32 = 0x10000000;

const STATUS_RE: u32	 = 0x02000000;	// Unsupported

const STATUS_BEV: u32 = 0x00400000;
const STATUS_TS: u32	 = 0x00200000;	// Unlikely to be supported
const STATUS_PE: u32	 = 0x00100000;	// Unsupported
const STATUS_CM: u32	 = 0x00080000;	// Unsupported
const STATUS_PZ: u32	 = 0x00040000;	// Unsupported
const STATUS_SWC: u32 = 0x00020000;	// Unsupported
const STATUS_ISC: u32 = 0x00010000;	// Unsupported

const STATUS_IM: u32	 = 0x0000FF00;

const STATUS_KUO: u32 = 0x00000020;
const STATUS_IEO: u32 = 0x00000010;
const STATUS_KUP: u32 = 0x00000008;
const STATUS_IEP: u32 = 0x00000004;
const STATUS_KUC: u32 = 0x00000002;
const STATUS_IEC: u32 = 0x00000001;

const ALL_STATUS_BITS: u32 =
	STATUS_CU3 | STATUS_CU2 | STATUS_CU1 | STATUS_CU0 |
	STATUS_BEV | STATUS_IM |
	STATUS_KUO | STATUS_IEO | STATUS_KUP | STATUS_IEP | STATUS_KUC | STATUS_IEC;

const TLB_PAGES: u32 = 64;

static mut STATUS:u32 = 0;
static mut INDEX:u32 = 0;
static mut ENTRY_HI:u32 = 0;
static mut ENTRY_LO:u32 = 0;

static mut CAUSE:u32 = 0;
static mut EPC:u32 = 0;
static mut BAD_ADDR:u32 = 0;
static mut PT_BASE:u32 = 0;

fn random() -> u32 {
	static mut INC: u32 = 0x8;

	unsafe {
		INC += 1;
		if (INC >= 0x40) { INC = 0x8; }

		INC
	}
}

pub fn reset() {
	hash::reset();

	unsafe {
		STATUS = STATUS_KUC | STATUS_BEV;
		CAUSE = 0;
	}
}

/*
int cop_enabled(int cop) {
	return (((STATUS >> 18) | ((STATUS & STATUS_KUC) ? 1 : 0)) >> cop) & 1;
}

void interrupt(int i) {
	STATUS |= (1 << (i + 8)) & STATUS_IM;
}

void handle_interrupt() {
	if ((STATUS & STATUS_IEC) && (CAUSE & STATUS & STATUS_IM)) {
		trap(exceptions::INTERRUPT, registers.pc, 0, 0);
	}
}

uint32_t read_tlb(uint32_t hash) {
	uint32_t regular = find_hash(hash & ~0x03F);

	if (regular & 0x200) {
		return regular;
	}

	return find_hash(hash | 0xFFF);
}

static void write_tlb(int INDEX) {
	// Ignore TLB entries that can CAUSE a collision (normally would CAUSE a system reset)
	if (read_tlb(ENTRY_HI) & 0x200) {
		return ;
	}

	// Clear out previous TLB element (if it was valid)
	if (tlb_lo[INDEX] & 0x200) {
		uint32_t INDEXWas = tlb_hi[INDEX] | ((tlb_lo[INDEX] & 0x100) ? 0xFFF : 0);
		clear_hash(INDEXWas);
	}

	// Setup our fast lookup
	if (ENTRY_LO & 0x200) {
		uint32_t INDEXIs = ENTRY_HI | ((ENTRY_LO & 0x100) ? 0xFFF : 0);
		write_hash(INDEXIs, ENTRY_LO | INDEX);
	}

	// Store our TLB (does not handle global)
	tlb_lo[INDEX] = ENTRY_LO;
	tlb_hi[INDEX] = ENTRY_HI;
}

uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed) {
	// let cached = true;
	if (address & 0x8000000 && ~STATUS & STATUS_KUC) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	// Check if line is cached (does nothing)
	if ((address & 0xE0000000) == 0xA0000000) {
		// cached = false;
	}

	if ((address & 0xC0000000) != 0x80000000) {
		uint32_t page = address & 0xFFFFF000;
		uint32_t result = read_tlb(page | (ENTRY_HI & 0xFFF));

		// cached = ~result & 0x0800;

		// TLB line is inactive
		if (~result & 0x0200) {
			BAD_ADDR = address;
			ENTRY_HI = (ENTRY_HI & ~0xFFFFF000) | (address & 0xFFFFF000);
			exception(write ? exceptions::TLBSTORE : exceptions::TLBLOAD, address, delayed, 0);
		}

		// Writes are not permitted
		if (write && ~result & 0x0400) {
			BAD_ADDR = address;
			ENTRY_HI = (ENTRY_HI & ~0xFFFFF000) | (address & 0xFFFFF000);
			exception(exceptions::TLBMOD, address, delayed, 0);
		}

		return (result & 0xFFFFF000) | (address & 0x00000FFF);
	} else {
		return address & 0x1FFFFFFC;
	}
}

void trap(int exception, int address, int delayed, int coprocessor) {
	registers.clocks -= (address - registers.start_pc + 4) >> 2;

	// Preserve return address
	EPC = address;

	// Enter kernal mode, and shift the mode flags
	STATUS = (STATUS & ~ 0x3F) | ((STATUS << 2) & 0x3C) | STATUS_KUC;

	// Set our CAUSE register
	CAUSE = (CAUSE & 0x0000FF00) |
		(delayed ? 0x80000000 : 0) |
		(coprocessor << 28) |
		(exception << 2);

	switch (exception) {
	case exceptions::TLBLOAD:
	case exceptions::TLBSTORE:
		registers.pc = (STATUS & STATUS_BEV) ? 0xbfc00100 : 0x80000000;
		break ;

	default:
		registers.pc = (STATUS & STATUS_BEV) ? 0xbfc00180 : 0x80000080;
		break ;
	}
}

// ******
// ** Co-Processor Move registers
// ******

void MFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t value;

	switch (FIELD_RD(word)) {
	// Random registers
	case 0xF: // c0_prid
		value = PROCESSOR_ID;
		break ;

	// Virtual-memory registers
	case 0x0: // c0_INDEX
		value = INDEX;
		break ;
	case 0x1: // c0_random (non-deterministic, cheap method)
		value = random() << 8;
		break ;
	case 0x2: // c0_entrylo
		value = ENTRY_LO;
		break ;
	case 0xA: // c0_entryhi
		value = ENTRY_HI;
		break ;
	case 0x4: // c0_context
		value = PT_BASE | ((BAD_ADDR & 0xFFFFF800) >> 11);
		break ;
	case 0x8: // c0_vaddr
		value = BAD_ADDR;
		break ;

	// Status/Exception registers
	case 0xC: // c0_STATUS
		value = STATUS;
		break ;
	case 0xD: // c0_CAUSE
		value = CAUSE;
		break ;
	case 0xE: // c0_EPC
		value = EPC;
		break ;
	default:
		value = 0;
		break ;
	}

	write_reg(FIELD_RT(word), value);
}

void MTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t value = read_reg(FIELD_RT(word));

	switch (FIELD_RD(word)) {
	// Virtual-memory registers
	case 0x0: // c0_INDEX
		INDEX = value & 0x3F00;
		break ;
	case 0x2: // c0_entrylo
		ENTRY_LO = value & 0xFFFFFFC0;
		break ;
	case 0xA: // c0_entryhi
		ENTRY_HI = value & 0xFFFFFF00;
		break ;
	case 0x4: // c0_context
		PT_BASE = value & 0xFFE00000;
		break ;

	// Status/Exception registers
	case 0xC: // c0_STATUS
		STATUS = value & ALL_STATUS_BITS;
		break ;
	case 0xD: // c0_CAUSE
		CAUSE = (CAUSE & ~0x0000FF00) | (value & 0x0000FF00);
		break ;
	}
}

// ******
// ** Co-Processor instructions
// ******

void RFE(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	STATUS = (STATUS & ~0xF) | ((STATUS >> 2) & 0xF);
}

void TLBR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	ENTRY_LO = tlb_lo[(INDEX >> 8) & 0x3F];
	ENTRY_HI = tlb_hi[(INDEX >> 8) & 0x3F];
}

void TLBWI(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb((INDEX >> 8) & 0x3F);
}

void TLBWR(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	write_tlb(random());
}

void TLBP(uint32_t address, uint32_t word, uint32_t delayed) {
	if (!cop_enabled(0)) {
		exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}

	uint32_t found = read_tlb(ENTRY_HI);

	if (found & 0x200) {
		INDEX = (found & 0x3F) << 8;
	} else {
		INDEX |= 0x80000000;
	}
}
*/

// ***********
// ** Unused move instructions
// ***********
#[no_mangle]
pub fn CFC0(address: u32, word: u32, delayed: u32) {
	unsafe {
		imports::exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}
}

pub fn CTC0(address: u32, word: u32, delayed: u32) {
	unsafe {
		imports::exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}
}

pub fn LWC0(address: u32, word: u32, delayed: u32) {
	unsafe {
		imports::exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}
}

pub fn SWC0(address: u32, word: u32, delayed: u32) {
	unsafe {
		imports::exception(exceptions::COPROCESSORUNUSABLE, address, delayed, 0);
	}
}
