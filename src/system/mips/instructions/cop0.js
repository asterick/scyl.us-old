const Exception = require("../exception").default;
const Consts = require("../consts");
import { read, write, call, exception, CALLS } from "./wast";

/******
 ** Co-Processor Move registers
 ******/

function MFC0(rt, rd, pc, delayed) {
	return [
		... rd,
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.MFC0 },
		... write(rt)
	];
}
MFC0.assembly = (rt, rd) => `mfc0\t${Consts.Registers[rt]}, ${Consts.COP0Registers[rd]}`;

function MTC0(rt, rd, pc, delayed) {
	return [].concat(
		... rd,
		... read(rt),
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.MTC0 }
	);
}
MTC0.assembly = (rt, rd) => `mtc0\t${Consts.Registers[rt]}, ${Consts.COP0Registers[rd]}`;

/******
 ** Co-Processor instructions
 ******/

function RFE(pc, delayed) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.RFE }
	];
}
RFE.assembly = () => `cop0\trte`;

function TLBR(pc, delayed) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBR }
	];
}
TLBR.assembly = () => `cop0\ttlbr`;

function TLBWI(pc, delayed) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBWI }
	];
}
TLBWI.assembly = () => `cop0\ttlbwi`;

function TLBWR(pc, delayed) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBWR }
	];
}
TLBWR.assembly = () => `cop0\ttlbwr`;

function TLBP(pc, delayed) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBP }
	];
}
TLBP.assembly = () => `cop0\ttlbp`;

/***********
 ** Unused move instructions
 ***********/
function CFC0(pc, delayed) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
CFC0.assembly = (rt, rd) => `cfc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;

function CTC0(pc, delayed) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
CTC0.assembly = (rt, rd) => `ctc0\t${Consts.Registers[rt]}, cop0cnt${rd}`;

export function LWC0(pc, delayed) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
LWC0.assembly = (rs, rt, imm16) => `lwc0\t${Consts.COP0Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`;

export function SWC0(pc, delayed) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
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
