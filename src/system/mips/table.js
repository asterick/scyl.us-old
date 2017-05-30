import * as Instructions from "./process!./instructions";
import * as COP0 from "./process!./cop0";

import Fields from "./fields";

const DecodeTable = {
	field: "opcode",
	fallback: Instructions.ReservedInstruction,
	0x00: {
		field: "funct",
		0x00: Instructions.SLL,
	 	0x02: Instructions.SRL,
	 	0x03: Instructions.SRA,
	 	0x04: Instructions.SLLV,
	 	0x06: Instructions.SRLV,
	 	0x07: Instructions.SRAV,
		0x08: Instructions.JR,
		0x09: Instructions.JALR,
		0x0C: Instructions.SYSCALL,
		0x0D: Instructions.BREAK,
		0x10: Instructions.MFHI,
		0x11: Instructions.MTHI,
		0x12: Instructions.MFLO,
		0x13: Instructions.MTLO,
		0x18: Instructions.MULT,
		0x19: Instructions.MULTU,
		0x1A: Instructions.DIV,
		0x1B: Instructions.DIVU,
		0x20: Instructions.ADD,
		0x21: Instructions.ADDU,
		0x22: Instructions.SUB,
		0x23: Instructions.SUBU,
		0x24: Instructions.AND,
		0x25: Instructions.OR,
		0x26: Instructions.XOR,
		0x27: Instructions.NOR,
		0x2A: Instructions.SLT,
		0x2B: Instructions.SLTU
	},
	0x01: {
		field: "rt",
	  	0x00: Instructions.BLTZ,
	  	0x01: Instructions.BGEZ,
	  	0x10: Instructions.BLTZAL,
	  	0x11: Instructions.BGEZAL
	},
	0x02: Instructions.J,
	0x03: Instructions.JAL,
	0x04: Instructions.BEQ,
	0x05: Instructions.BNE,
	0x06: Instructions.BLEZ,
	0x07: Instructions.BGTZ,
	0x08: Instructions.ADDI,
	0x09: Instructions.ADDIU,
	0x0A: Instructions.SLTI,
	0x0B: Instructions.SLTIU,
	0x0C: Instructions.ANDI,
	0x0D: Instructions.ORI,
	0x0E: Instructions.XORI,
	0x0F: Instructions.LUI,
	0x10: COP0.default,
	0x11: Instructions.CopUnusable,
	0x13: Instructions.CopUnusable,
	0x13: Instructions.CopUnusable,
	0x20: Instructions.LB,
	0x21: Instructions.LH,
	0x22: Instructions.LWL,
	0x23: Instructions.LW,
	0x24: Instructions.LBU,
	0x25: Instructions.LHU,
	0x26: Instructions.LWR,
	0x28: Instructions.SB,
	0x29: Instructions.SH,
	0x2A: Instructions.SWL,
	0x2B: Instructions.SW,
	0x2E: Instructions.SWR,
	0x30: COP0.LWC,
	0x31: Instructions.CopUnusable,
	0x13: Instructions.CopUnusable,
	0x33: Instructions.CopUnusable,
	0x38: COP0.SWC,
	0x39: Instructions.CopUnusable,
	0x13: Instructions.CopUnusable,
	0x3B: Instructions.CopUnusable
};

export default function (word) {
	const fields = new Fields(word);
	var fallback = null;
	var entry = DecodeTable;

	while (typeof entry !== "function") {
		if (entry === undefined) { break ; }

		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.instruction = entry || fallback;

	return fields;
}
