import Exception from "./exception";
import Registers from "./registers";

import { locate, compile, initialize as initialize_compiler } from "./instructions";
import { tick } from "..";

import { MAX_COMPILE_SIZE, MIN_COMPILE_SIZE, Exceptions } from "./consts";

import { read as cedar_read, write as cedar_write } from "../cedar";
import { read as spu_read, write as spu_write } from "../spu";
import { read as dsp_read, write as dsp_write } from "../dsp";
import { read as gpu_read, write as gpu_write } from "../gpu";

export var registers;
export var regions = null;
export var exports;

var cache = [];

const _environment = {
	// Execute bytecode
	execute,

	// Accessors
	timer_read, cedar_read, gpu_read, dsp_read, spu_read, 
	timer_write, cedar_write, gpu_write, dsp_write, spu_write,

	// Glue
	exception: (code, pc, delayed, cop) => {
		throw new Exception(code, pc, delayed, cop);
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
			exports = module.instance.exports;
			cache = [];

			const address = exports.getConfiguration();
			const memory = exports.memory.buffer;
			const bytes = new Uint8Array(exports.memory.buffer);
			const dv = new DataView(memory);

			registers = new Uint32Array(memory, dv.getUint32(address, true), 64);
		})
}

// Execution core
export function reset() {
	cache = [];
	exports.reset();
}

// Execute a single frame
export function block_execute () {
	exports.handle_interrupt();

	while (Registers.clocks > 0) {
		const start_pc = Registers.pc
		const block_size = blockSize(start_pc);
		const block_mask = -block_size; // equilivant to ~(block_size - 1)
		const physical = (exports.translate(start_pc, false, start_pc, false) & block_mask) >>> 0;
		const logical = (start_pc & block_mask) >>> 0;

		var funct = cache[physical];

		if (funct === undefined || !funct.code || funct.logical !== logical) {
			WebAssembly.instantiate(compile(logical, block_size / 4), {
				env: _environment,
				core: exports
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
				Registers.clocks -= (e.pc - start_pc) / 4;
				exports.trap(e.exception, e.pc, e.delayed, e.coprocessor);
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

export function step_execute () {
	exports.handle_interrupt();

	try {
		const start_pc = Registers.pc;
		Registers.pc += 4;
		execute(start_pc, false);
	} catch (e) {
		if (e instanceof Exception) {
			exports.trap(e.exception, e.pc, e.delayed, e.coprocessor);
		} else {
			throw e;
		}
	}
}

export function load (word, pc) {
	return exports.load(word, pc);
}

// This forces delay slots at the end of a page to
// be software interpreted so TLB changes don't
// cause cache failures
function execute(pc, delayed) {
	const data = load(pc, true, pc, delayed);
	const call = locate(data);

	Registers.clocks--;
	exports[call.name](pc, data, delayed);
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
