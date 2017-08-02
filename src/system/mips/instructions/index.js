import { FieldsNumeric } from "./fields";
import Instructions from "./base";
import { module, dynamicCall, LOCAL_VARS, CALLS } from "./wast";

export default function locate(word) {
	const fields = new FieldsNumeric(word);
	var entry = Instructions;
	var fallback = null;

	while (entry.type !== "object") {
		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.instruction = entry || fallback;

	return fields;
}

export function disassemble(word, address) {
	const op = locate(word);
	const asm = op.instruction.assembly;

	return asm(new FieldsNumeric(word), address);
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

console.log(createDynamic(Instructions));

/*
import Import from "../../../dynast/import";
fetch("test.wasm").then((blob) => blob.arrayBuffer())
	.then((ab) => {
		console.log(JSON.stringify(Import(ab), null, 4))
	})
*/