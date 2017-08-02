import { NumericFields, FieldsWasm } from "./fields";
import Instructions from "./base";

// Field decode helper object

export default function (word) {
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

function walk(table) {
	Object.keys(table).forEach((key) => {
		const entry = table[key];
		if (typeof entry === "function") {

			console.log(entry.assembly(new Fields(0xCDCDCDCD)))
		} else if (typeof entry === 'object') {
			walk(entry);
		}
	});
}

walk(Instructions);
