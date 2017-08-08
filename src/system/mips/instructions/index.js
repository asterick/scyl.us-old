import { FieldsNumeric } from "./fields";
import Disassemble from "./disassemble";
import Instructions from "./base";
export { Compiler } from "./wast";

export function locate(word) {
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
