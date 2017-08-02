import { FieldsNumeric, FieldsWasm } from "./fields";
import Instructions from "./base";
import { local, LOCAL_VARS, CALLS } from "./wast";

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
	const asm = op.instruction.assembly;

	return asm(new FieldsNumeric(word), address);
}

function dynamicCall(func) {
	return func(
		FieldsWasm.dynamic(),
		local(LOCAL_VARS.INSTRUCTION_PC),
		local(LOCAL_VARS.INSTRUCTION_DELAYED),
		() => [
			local(LOCAL_VARS.INSTRUCTION_PC),
			{ op: 'i32.const', value: 4 },
			{ op: 'i32.add' },
	        { op: "call", function_index: CALLS.EXECUTE },
		],
		[{ op: 'return' }]
	)
}

// Start generating steppable intructions
function walk(table) {
	Object.keys(table).forEach((key) => {
		const entry = table[key];
		if (typeof entry === "function") {
			// TODO: actually generate wasm here
			console.log(entry.name, JSON.stringify(dynamicCall(entry),null,4));
		} else if (typeof entry === 'object') {
			walk(entry);
		}
	});
}

walk(Instructions);

console.log(Instructions)
