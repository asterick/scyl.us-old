import Exception from "./exception";
import { locate, compile, initialize as initialize_compiler } from "./instructions";
import { read, write, tick } from "..";
import Registers from "./registers";

import { MAX_COMPILE_SIZE, MIN_COMPILE_SIZE, Exceptions } from "./consts";

const MAX_CLOCK_LAG = 60000;

export var registers;
export var regions = null;

var cache = [];
var wasm_exports;

const _environment = {
	execute,
	exception: (code, pc, delayed, cop) => {
		throw new Exception(code, pc, delayed, cop);
	},
	read: (physical, code, pc, delayed) => {
		try {
			return read(code, physical >>> 0);
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	},
	write: (physical, value, mask, pc, delayed) => {
		try {
			write(physical, value, mask);
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	},
	invalidate: (physical, logical) => {
		// Invalidate cache line
		const cache_line = physical & -blockSize(logical);  // equilivant to ~(block_size - 1)
		const entry = cache[cache_line];

		// Clear this row out (de-reference the function so we don't leak)
		if (entry) {
			entry.code = null;
			cache[cache_line] = null;
		}
	}
};

function configure(cfg) {
	const memory = wasm_exports.memory.buffer;
	const bytes = new Uint8Array(wasm_exports.memory.buffer);
	const dv = new DataView(memory);

	registers = new Uint32Array(memory, dv.getUint32(cfg+4, true), 64);
	var address = dv.getUint32(cfg+0, true);

	let flags;

	regions = {};

	while (true) {
		let region = new Uint32Array(memory, address, 5);
		flags = region[4];
		address += 20;

		const decoder = new TextDecoder('utf-8');
		for (var i = region[0]; bytes[i]; i++) ;
		const name = decoder.decode(bytes.subarray(region[0], i));

		regions[name] = {
			start: region[1],
			length: region[2],
			end: region[1]+region[2],
			flags: region[4],
			buffer: new Uint32Array(memory, region[3], region[2] / 4)
		};

		if (flags & 4) break ;
	}
}

/*******
** Runtime section
*******/
export function initialize() {
	return fetch("core.wasm")
		.then(blob => blob.arrayBuffer())
		.then(ab => WebAssembly.instantiate(initialize_compiler(ab), {
				env: _environment
		}))
		.then(module => {
			wasm_exports = module.instance.exports;
			cache = [];

			configure(wasm_exports.getConfiguration())
		})
}

// Execution core
export function reset() {
	cache = [];
	wasm_exports.reset();
}

// Execute a single frame
export function block_execute () {
	wasm_exports.handle_interrupt();

	while (Registers.clocks > 0) {
		const block_size = blockSize(Registers.pc);
		const block_mask = -block_size; // equilivant to ~(block_size - 1)
		const physical = (wasm_exports.translate(Registers.pc, false, Registers.pc, false) & block_mask) >>> 0;
		const logical = (Registers.pc & block_mask) >>> 0;

		var funct = cache[physical];

		if (funct === undefined || !funct.code || funct.logical !== logical) {
			WebAssembly.instantiate(compile(logical, block_size / 4), {
				env: _environment,
				core: wasm_exports
			}).then((result) => {
				const funct = {
					code: result.instance.exports.block,
					logical: logical
				};

				for (let start = physical; start < physical + block_size; start += MIN_COMPILE_SIZE) {
					cache[start] = funct;
				}

				// Resume execution after the JIT core completes
				tick();
			});

			// Execution has paused, waiting for compiler to finish
			return true;
		}

		try {
			funct.code();
		} catch (e) {
			if (e instanceof Exception) {
				wasm_exports.trap(e.exception, e.pc, e.delayed, e.coprocessor);
			} else {
				throw e;
			}
		}
	}

	// CPU is caught up
	return false;
}

// NOTE: This does not advance the system clock
// this is only here for debugging purposes

export function step () {
	try {
		Registers.start_pc = Registers.pc;
		Registers.pc += 4;
		execute(Registers.start_pc, false);
	} catch (e) {
		if (e instanceof Exception) {
			wasm_exports.trap(e.exception, e.pc, e.delayed, e.coprocessor);
		} else {
			throw e;
		}
	}

	wasm_exports.handle_interrupt();
}

export function load (word, pc) {
	return wasm_exports.load(word, pc);
}

// This forces delay slots at the end of a page to
// be software interpreted so TLB changes don't
// cause cache failures
function execute(pc, delayed) {
	const data = load(pc, true, pc, delayed);
	const call = locate(data);

	wasm_exports[call.name](pc, data, delayed);

	Registers.clocks--;
}

export function blockSize(address) {
	if ((address & 0xC0000000) !== (0x80000000 >> 0)) {
		return MIN_COMPILE_SIZE;
	} else if (address >= 0x1FC00000 && address < 0x1FC80000) {
		return MAX_COMPILE_SIZE;
	} else {
		return MIN_COMPILE_SIZE;
	}
}
