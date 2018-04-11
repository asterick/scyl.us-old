import { Registers, COP0Registers } from "./consts";
import { locate } from "./instructions";
import * as table_calls from "./disassembly";

export const instructions = {
    UndefinedOperation: (fields, pc) => ``,
};

Object.assign(instructions, table_calls);

export function disassemble(word, address) {
	const op = locate(word);

	if (op.name === "UndefinedOperation") return "und"

	return instructions[op.name](op.word, address) || `failed ${op.name}`;
}
