const Exception = require("../exception").default;
const Consts = require("../consts");

const Registers = [
	 "cop0dat0", "cop0dat1", "cop0dat2",      "BPC",
	 "cop0dat4",      "BDA", "JUMPDEST",     "DCIC",
	 "BadVaddr",     "BDAM","cop0dat10",     "BPCM",
	       "SR",    "CAUSE",      "EPC",     "PRID",
	"cop0dat16","cop0dat17","cop0dat18","cop0dat19",
	"cop0dat20","cop0dat21","cop0dat22","cop0dat23",
	"cop0dat24","cop0dat25","cop0dat26","cop0dat27",
	"cop0dat28","cop0dat29","cop0dat30","cop0dat31",
];

/******
 ** CoProcessor instructions
 ******/

export function MFC(rt, rd, pc, delayed) {
	let value = this.read_cop0(rd, pc, delayed);
	if (rt) {
		this.registers[rt] = value;
	}
}

export function MTC(rt, rd, pc, delayed) {
	this.write_cop0(rd, rt ? this.registers[rt] : 0, pc, delayed);
}

export function RTE(imm25, pc, delayed) {
	this.rte();
}

export function CFC(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

export function CTC(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

export function LWC(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}

export function SWC(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}

export function BCF(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}

export function BCT(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}

export function TLBR(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

export function TLBWI(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

export function TLBWR(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

export function TLBP(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}

MFC.assembly = (rt, rd) => `mfc0\t${Consts.Registers[rt]}, ${Registers[rd]}`;
CFC.assembly = (rt, rd) => `cfc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;
MTC.assembly = (rt, rd) => `mtc0\t${Consts.Registers[rt]}, ${Registers[rd]}`;
CTC.assembly = (rt, rd) => `ctc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;
LWC.assembly = (rs, rt, imm16) => `lwc0\t${Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`;
SWC.assembly = (rs, rt, imm16) => `swc0\t${Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`;
BCT.assembly = (simm16, pc) => `bc0t\t${((pc + 4) + (simm16 * 4)).toString(16)}`;
BCF.assembly = (simm16, pc) => `bc0f\t${((pc + 4) + (simm16 * 4)).toString(16)}`;
TLBR.assembly = () => `cop0\ttlbr`;
TLBWI.assembly = () => `cop0\ttlbwi`;
TLBWR.assembly = () => `cop0\ttlbwr`;
TLBP.assembly = () => `cop0\ttlbp`;
TLBP.assembly = () => `cop0\trte`;

export default {
	field: "rs",
  	0x00: MFC,
  	0x02: CFC,
  	0x04: MTC,
  	0x06: CTC,
  	0x08: {
  		field: "rt",
  		0x00: BCF,
  		0x01: BCT,
  	},
	0x10: {
		field: "function",
		0x01: TLBR,
		0x02: TLBWI,
		0x06: TLBWR,
		0x08: TLBP,
		0x10: RTE
	},
};
