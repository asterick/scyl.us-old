import { Fields } from "./fields";
import Disassemble from "./disassemble";
import Table from "./table";
export { Compiler } from "./wast";

export function locate(word) {
	const fields = new Fields(word);
	var entry = Table;
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
