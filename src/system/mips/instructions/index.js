import { NumericFields, FieldsWasm } from "./fields";
import Instructions from "./base";

export default function locate(word) {
	const fields = new NumericFields(word);
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
	const asm = op.instruction.assembly;

	return asm(new NumericFields(word), address);
}

function walk(table) {
	Object.keys(table).forEach((key) => {
		const entry = table[key];
		if (typeof entry === "function") {
// FIELDS, PC, DELAYED, DELAY, ESCAPE
			console.log(entry)
		} else if (typeof entry === 'object') {
			walk(entry);
		}
	});
}

walk(Instructions);

console.log(Instructions)
