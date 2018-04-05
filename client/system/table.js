import { Registers, COP0Registers } from "./consts";
import { locate } from "./instructions";

export const instructions = {
    UndefinedOperation: (fields, pc) => `und`,
};

export function disassemble(word, address) {
	const op = locate(word);

	if (instructions[op.name] === undefined) return `failed ${op.name}`

	return instructions[op.name](op, address);
}
