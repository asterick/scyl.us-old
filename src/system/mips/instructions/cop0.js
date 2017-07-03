const Exception = require("../exception").default;
const Consts = require("../consts");

import * as WAST from "./wast";

/******
 ** Co-Processor Move registers
 ******/

export function MFC0(rt, rd, pc, delayed) {
	let value = this._mfc0(rd, pc, delayed);
	if (rt) {
		this.registers[rt] = value;
	}
}
MFC0.wasm = function (rt, rd, pc, delayed) { throw new Error("TODO"); }
MFC0.assembly = (rt, rd) => `mfc0\t${Consts.Registers[rt]}, ${Consts.COP0Registers[rd]}`;

export function MTC0(rt, rd, pc, delayed) {
	this._mtc0(rd, rt ? this.registers[rt] : 0, pc, delayed);
}
MTC0.wasm = function (rt, rd, pc, delayed) { throw new Error("TODO"); }
MTC0.assembly = (rt, rd) => `mtc0\t${Consts.Registers[rt]}, ${Consts.COP0Registers[rd]}`;

/******
 ** Co-Processor instructions
 ******/

export function RFE(imm25, pc, delayed) {
	this._rfe(pc, delayed);
}
RFE.wasm = function (imm25, pc, delayed) { throw new Error("TODO"); }
RFE.assembly = () => `cop0\trte`;

export function TLBR(pc, delayed) {
	this._tlbr(pc, delayed);
}
TLBR.wasm = function (pc, delayed) { throw new Error("TODO"); }
TLBR.assembly = () => `cop0\ttlbr`;

export function TLBWI(pc, delayed) {
	this._tlbwi(pc, delayed);
}
TLBWI.wasm = function (pc, delayed) { throw new Error("TODO"); }
TLBWI.assembly = () => `cop0\ttlbwi`;

export function TLBWR(pc, delayed) {
	this._tlbwr(pc, delayed);
}
TLBWR.wasm = function (pc, delayed) { throw new Error("TODO"); }
TLBWR.assembly = () => `cop0\ttlbwr`;

export function TLBP(pc, delayed) {
	this._tlbp(pc, delayed);
}
TLBP.wasm = function (pc, delayed) { throw new Error("TODO"); }
TLBP.assembly = () => `cop0\ttlbp`;

/***********
 ** Unused move instructions
 ***********/
export function CFC0(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed, 0);
}
CFC0.wasm = function (pc, delayed) { throw new Error("TODO"); }
CFC0.assembly = (rt, rd) => `cfc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;

export function CTC0(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed, 0);
}
CTC0.wasm = function (pc, delayed) { throw new Error("TODO"); }
CTC0.assembly = (rt, rd) => `ctc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;

export function LWC0(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed, 0);
}
LWC0.wasm = function (pc, delayed) { throw new Error("TODO"); }
LWC0.assembly = (rs, rt, imm16) => `lwc0\t${Consts.COP0Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`;

export function SWC0(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed, 0);
}
SWC0.wasm = function (pc, delayed) { throw new Error("TODO"); }
SWC0.assembly = (rs, rt, imm16) => `swc0\t${Consts.COP0Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`;

export default {
	field: "rs",
  	0x00: MFC0,
  	0x02: CFC0,
  	0x04: MTC0,
  	0x06: CTC0,
	0x10: {
		// Note: this does not match all the extra zeros
		field: "function",
		0x01: TLBR,
		0x02: TLBWI,
		0x06: TLBWR,
		0x08: TLBP,
		0x10: RFE
	},
};
