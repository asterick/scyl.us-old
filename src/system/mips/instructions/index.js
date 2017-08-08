import { FieldsNumeric } from "./fields";
import Disassemble from "./disassemble";
import Instructions from "./base";
//import { module, dynamicCall, staticBlock } from "./wast";

export default function locate(word) {
	const fields = new FieldsNumeric(word);
	var entry = Instructions;
	var fallback = null;

	while (typeof entry === "object") {
		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.name = entry || fallback;

	return fields;
}

export function disassemble(word, address) {
	const op = locate(word);
	return Disassemble[op.name](op, address);
}

/*
export function assembleBlock(start, length, read) {
	return module({ block: staticBlock(start, length, read) });
}
*/