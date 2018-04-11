import * as table_calls from "./disassembly";
import { locate } from "./instructions";

export const Conditions = [ "eq", "ne", "cs", "cc", "mi", "pl", "vs", "vc", "hi", "ls", "ge", "lt", "gt", "le", "", "nv" ];
export const Registers = [ "r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "sp", "lr", "pc" ];
export const ShiftType = ["lsl", "lsr", "asr", "ror"];
export const MSRFields = ["", "c", "x", "xc", "s", "sc", "sx", "sxc", "f", "fc", "fx", "fxc", "fs", "fsc", "fsx", "fsxc"];

export const instructions = {
    UndefinedOperation: (fields, pc) => ``,
};

Object.assign(instructions, table_calls);

export function disassemble(word, address) {
	const op = locate(word);

	if (op.name === "undefined_op") return "und"

	return instructions[op.name](op.word, address);
}
