import Exception from "./exception";
import { locate, compile, initialize as initialize_compiler } from "./instructions";
import { read, write } from "..";
import Registers from "./registers";

import { MAX_COMPILE_SIZE, MIN_COMPILE_SIZE, Exceptions } from "./consts";

const MAX_CLOCK_LAG = 60000;

const _environment = {
	exception: (code, pc, delayed, cop) => {
		throw new Exception(code, pc, delayed, cop);
	},
	execute: execute,
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

export var registers;
export var regions = [];

var cache = [];
var wasm_exports;
var timer;

/*******
** Runtime section
*******/
export function initialize() {
	return fetch("core.wasm")
		.then((blob) => blob.arrayBuffer())
		.then((ab) => {
			initialize_compiler(ab);

			return WebAssembly.instantiate(ab, {
				env: _environment
			});
		})
		.then((module) => {
			wasm_exports =  module.instance.exports;

			const memory = wasm_exports.memory.buffer;

			let addr = wasm_exports.getMemoryRegions();
			let flags;

			regions = [];
			do {
				let region = new Uint32Array(memory, addr, 4);
				flags = region[3];
				addr += 16;

				regions.push({
					start: region[0],
					length: region[1],
					end: region[0]+region[1],
					flags: region[3],
					buffer: new Uint8Array(memory, region[2], region[1])
				});
			} while(~flags & 4);

			registers = new Uint32Array(memory, wasm_exports.getRegisterAddress(), 64);

			reset();
		});
}

// Execution core
export function reset() {
	timer = 0;
	cache = [];

	wasm_exports.reset();
}

// Execute a single frame
export function tick (ticks) {
	// Advance clock, with 0.1 sec a max 'lag' time
	const _prev = Registers.clocks = Math.min(ticks + Registers.clocks, MAX_CLOCK_LAG);

	while (Registers.clocks > 0) {
		const block_size = blockSize(Registers.pc);
		const block_mask = -block_size; // equilivant to ~(block_size - 1)
		const physical = (wasm_exports.translate(Registers.pc, false, Registers.pc, false) & block_mask) >>> 0;
		const logical = (Registers.pc & block_mask) >>> 0;

		var funct = cache[physical];

		if (funct === undefined || !funct.code || funct.logical !== logical) {
			const defs = compile(logical, block_size / 4);

			WebAssembly.instantiate(defs, {
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
			return false;
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

		timer += _prev - Registers.clocks;
		wasm_exports.handle_interrupt();
	}

	return true;
}

export function step () {
	const _prev = Registers.clocks;

	try {
		Registers.start_pc = Registers.pc;
		Registers.pc += 4;

		execute(Registers.start_pc, false);
		Registers.clocks--;	// Could be off by one, don't mind that much
	} catch (e) {
		if (e instanceof Exception) {
			wasm_exports.trap(e.exception, e.pc, e.delayed, e.coprocessor);
		} else {
			throw e;
		}
	}

	timer += _prev - Registers.clocks;
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
