export const MIN_COMPILE_SIZE	= 0x1000;				// One TLB page
export const MAX_COMPILE_SIZE	= 0x10000;				// 64K blocks are the maximum block compile size
export const SYSTEM_CLOCK		= 15000000;				// 15mhz core clock

export const Registers = [
 	// Standard r0-r31
	"zero", "ra",  "sp",  "gp", "tp", "t0", "t1", "t2",
	  "s0", "s1",  "a0",  "a1", "a2", "a3", "a4", "a5",
	  "a6", "a7",  "s2",  "s3", "s4", "s5", "s6", "s7",
	  "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6"

	// These are special upper registers
	  "pc"
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
