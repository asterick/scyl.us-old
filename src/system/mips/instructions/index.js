import { FieldsNumeric } from "./fields";
import Instructions from "./base";
import { module, dynamicCall, REGS, CALLS } from "./wast";

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

// Create our step through functions
const memory = new WebAssembly.Memory({ initial: 1 });
const regs = new Uint32Array(memory.buffer, 0, 40);

WebAssembly.instantiate(createDynamic(Instructions), {
	processor: {
		memory: memory,
		delay_execute: (pc) => { console.log(pc) },
        exception: (code, pc, delayed, cop) => { throw new Error("Farts") },
    	load: (address, pc, delayed) => 0xDEADFACE,
    	store: (address, value, mask, pc, delayed) => null,
    	mfc0: (reg, pc, delayed) => 0xDEADFACE,
    	mtc0: (reg, word, pc, delayed) => null,
    	rfe: (pc, delayed) => null,
    	tlbr: (pc, delayed) => null,
    	tlbwi: (pc, delayed) => null,
    	tlbwr: (pc, delayed) => null,
    	tlbp: (pc, delayed) => null,
	}
}).then((result) => {
	regs[REGS.INSTRUCTION_WORD] 	= 0xFFFFFACE;
	regs[REGS.INSTRUCTION_PC] 		= 0xCAFEBABE;
	regs[REGS.INSTRUCTION_DELAYED] 	= 1;

	result.instance.exports.CopUnusable();
	console.log(regs);
});

/*
import Import from "../../../dynast/import";
fetch("test.wasm").then((blob) => blob.arrayBuffer())
	.then((ab) => {
		console.log(JSON.stringify(Import(ab), null, 4))
	})
*/
