import { FieldsNumeric } from "./fields";
import Instructions from "./base";
import { module, dynamicCall, staticBlock } from "./wast";

export default function locate(word) {
	const fields = new FieldsNumeric(word);
	var entry = Instructions;
	var fallback = null;

	while (typeof entry === "object") {
		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.instruction = entry || fallback;

	return fields;
}

export function disassemble(word, address) {
	const op = locate(word);
	return op.instruction.assembly(op, address);
}

export function assembleBlock(start, length, read) {
	return module({ block: staticBlock(start, length, read) });
}

// Start generating steppable intructions
function createDynamic(table) {
	function walk(table, acc = {}) {
		return Object.keys(table).reduce((acc, key) => {
			const entry = table[key];
			if (typeof entry === "function") {
				acc[entry.name] = dynamicCall(entry);
			} else if (typeof entry === 'object') {
				walk(entry, acc);
			}

			return acc;
		}, acc);
	}

	return module(walk(table));
}

export const StepperDefintion = createDynamic(Instructions);
