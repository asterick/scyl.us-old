export const MAX_BLOCK_CLOCK = 500000;
export const PROCESSOR_ID = 0x00000301;

export const Registers = [
	"zero", "at", "v0", "v1", "a0", "a1", "a2", "a3",
	  "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
	  "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
	  "t8", "t9", "k0", "k1", "gp", "sp", "fp", "ra"
];

export const COP0Registers = [
  	 "c0_index", "c0_random", "c0_entrylo",  "cop0reg3",
   "c0_context",  "cop0reg5",   "cop0reg6",  "cop0reg7",
	 "c0_vaddr",  "cop0reg9", "c0_entryhi", "cop0reg11",
    "c0_status",  "c0_cause",     "c0_epc",   "c0_prid",
	"cop0reg16", "cop0reg17",  "cop0reg18", "cop0reg19",
	"cop0reg20", "cop0reg21",  "cop0reg22", "cop0reg23",
	"cop0reg24", "cop0reg25",  "cop0reg26", "cop0reg27",
	"cop0reg28", "cop0reg29",  "cop0reg30", "cop0reg31"
];

export const Exceptions = {
	Interrupt: 0x00,
	TLBMod: 0x01,
	TLBLoad: 0x02,
	TLBStore: 0x03,
	AddressLoad: 0x04,
	AddressStore: 0x05,
	BusErrorInstruction: 0x06,
	BusErrorData: 0x07,
	SysCall: 0x08,
	Breakpoint: 0x09,
	ReservedInstruction: 0x0A,
	CoprocessorUnusable: 0x0B,
	Overflow: 0x0C
};

export const ExceptionNames = {
	0x00: "Interrupt",
	0x01: "TLBMod",
	0x02: "TLBLoad",
	0x03: "TLBStore",
	0x04: "AddressLoad",
	0x05: "AddressStore",
	0x06: "BusErrorInstruction",
	0x07: "BusErrorData",
	0x08: "SysCall",
	0x09: "Breakpoint",
	0x0A: "ReservedInstruction",
	0x0B: "CoprocessorUnusable",
	0x0C: "Overflow",
};
