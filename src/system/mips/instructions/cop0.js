import { value, read, write, call, exception, CALLS } from "./wast";
import * as Consts from "../consts";

/******
 ** Co-Processor Move registers
 ******/

function MFC0(fields, pc, delayed, delay) {
	return write(fields.rt, [
		... value(fields.rd),
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.MFC0 },
	]);
}
MFC0.assembly = (fields, pc) => `mfc0\t${Consts.Registers[fields.rt]}, ${Consts.COP0Registers[fields.rd]}`;

function MTC0(fields, pc, delayed, delay) {
	return [
		... value(fields.rd),
		... read(fields.rt),
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.MTC0 }
	];
}
MTC0.assembly = (fields, pc) => `mtc0\t${Consts.Registers[fields.rt]}, ${Consts.COP0Registers[fields.rd]}`;

/******
 ** Co-Processor instructions
 ******/

function RFE(fields, pc, delayed, delay) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.RFE }
	];
}
RFE.assembly = (fields, pc) => `cop0\trte`;

function TLBR(fields, pc, delayed, delay) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBR }
	];
}
TLBR.assembly = (fields, pc) => `cop0\ttlbr`;

function TLBWI(fields, pc, delayed, delay) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBWI }
	];
}
TLBWI.assembly = (fields, pc) => `cop0\ttlbwi`;

function TLBWR(fields, pc, delayed, delay) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBWR }
	];
}
TLBWR.assembly = (fields, pc) => `cop0\ttlbwr`;

function TLBP(fields, pc, delayed, delay) {
	return [
		... pc,
		... delayed,
		{ op: 'call', function_index: CALLS.TLBP }
	];
}
TLBP.assembly = (fields, pc) => `cop0\ttlbp`;

/***********
 ** Unused move instructions
 ***********/
function CFC0(fields, pc, delayed, delay) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
CFC0.assembly = (fields, pc) => `cfc0\t${Consts.Registers[fields.rt]}, cop0cnt${fields.rd}`;

function CTC0(fields, pc, delayed, delay) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
CTC0.assembly = (fields, pc) => `ctc0\t${Consts.Registers[fields.rt]}, cop0cnt${fields.rd}`;

export function LWC0(fields, pc, delayed, delay) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
LWC0.assembly = (fields, pc) => `lwc0\t${Consts.COP0Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`;

export function SWC0(fields, pc, delayed, delay) {
	return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
SWC0.assembly = (fields, pc) => `swc0\t${Consts.COP0Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`;

export default {
	field: "rs",
  	0x00: MFC0,			// UNVERIFIED
  	0x02: CFC0,
  	0x04: MTC0,			// UNVERIFIED
  	0x06: CTC0,
	0x10: {
		// Note: this does not match all the extra zeros
		field: "funct",
		0x01: TLBR,		// UNVERIFIED
		0x02: TLBWI,	// UNVERIFIED
		0x06: TLBWR,	// UNVERIFIED
		0x08: TLBP,		// UNVERIFIED
		0x10: RFE		// UNVERIFIED
	},
};
