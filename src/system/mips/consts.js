const MAX_LOOPS = 5;

const Registers = [
	"zero", "at", "v0", "v1", "a0", "a1", "a2", "a3",
	  "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
	  "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
	  "t8", "t9", "k0", "k1", "gp", "sp", "fp", "ra"
];

const Exceptions = {
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

const ExceptionNames = {
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

export { MAX_LOOPS, Registers, Exceptions, ExceptionNames };
