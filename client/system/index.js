import Exception from "./exception";
import Registers from "./registers";

import { locate, compile, initialize as initialize_compiler } from "./instructions";
import { Exceptions, SYSTEM_CLOCK, MAX_CLOCK_LATENCY, MAX_COMPILE_SIZE, MIN_COMPILE_SIZE } from "./consts";

import { read as cedar_read, write as cedar_write } from "./cedar";
import { read as spu_read, write as spu_write } from "./spu";
import { read as dsp_read, write as dsp_write } from "./dsp";

import { 
	register_memory,
	set_blend, set_texture, set_clut, set_draw, set_clip, set_viewport, set_dither, set_mask, 
	get_vram_data, set_vram_data, render 
} from "./gpu";

export { attach } from "./gpu";

export var registers;
export var regions = null;
export var exports;

export var running = false;

var adjust_clock;
var cache = [];

const _environment = {
	// Execute bytecode
	execute,

	// GPU Rendering calls
	set_blend, set_texture, set_clut, set_draw, set_clip, set_viewport, set_dither, set_mask,
	get_vram_data, set_vram_data, render,

	// Accessors
	cedar_read, dsp_read, spu_read, 
	cedar_write, dsp_write, spu_write,

	// Stub to stop complaining
	call_indirect: a => null,
	debug: (x, l) => {
		const array = new Uint32Array(exports.memory.buffer, x, l / 4);
		const out = new Array(array.length);
		for (var i = 0; i < array.length; i++) out[i] = array[i];
		console.log(out.map(v => v.toString(16)).join(" "));
	},

	// Glue
	exception: (code, pc, delayed, cop) => {
		throw new Exception(code, pc, delayed, cop);
	},
	invalidate: (physical, logical) => {
		// Invalidate cache line
		const entry = cache[physical];

		// Clear this row out (de-reference the function so we don't leak)
		if (entry) {
			entry.code = null;
			cache[cache_line] = null;
		}
	}
};


export function start () {
	if (running) return ;

	adjust_clock = Date.now();
	running = true;
	tick();
}

export function stop () {
	running = false;
}

export function tick () {
	// We have deferred execution (JIT compiler delay)
	if (block_execute()) {
		return ;
	}

	// System is caught up, advance our CPU clock since last execution
	const newClock = Date.now();
	const cycles = Math.min(MAX_CLOCK_LATENCY, (newClock - adjust_clock) * (SYSTEM_CLOCK / 1000));
	adjust_clock = newClock;

	// Allocate some more cycles for the CPU
	Registers.clocks += cycles;

	// Schedule next tick when the CPU is free
	if (running) setTimeout(tick, 0);
}

/*******
** Runtime section
*******/
export async function initialize() {
	const blob = await fetch("core.wasm");
	const ab = await blob.arrayBuffer();

	initialize_compiler(ab);
	
	const module = await WebAssembly.instantiate(ab, { env: _environment });

	exports = module.instance.exports;
	cache = [];

	const address = exports.getConfiguration();
	const memory = exports.memory.buffer;
	const bytes = new Uint8Array(exports.memory.buffer);
	const dv = new DataView(memory);

	registers = new Uint32Array(memory, dv.getUint32(address, true), 64);

	register_memory(memory);
	exports.test_gpu();

	return module;
}

// Execution core
export function reset() {
	cache = [];
	exports.reset();
}

// Execute a single frame
export function block_execute () {
	while (Registers.clocks > 0) {
		const start_pc = Registers.pc
		const block_size = blockSize(start_pc);
		const block_mask = -block_size; // equilivant to ~(block_size - 1)
		const physical = (exports.translate(start_pc, false, start_pc, false) & block_mask) >>> 0;
		const logical = (start_pc & block_mask) >>> 0;

		const funct = cache[physical];

		// Execution has paused for compiler
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

			return true;
		}

		try {
			exports.sync_state();
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

export function step_execute () {
	try {
		const start_pc = Registers.pc;
		Registers.pc += 4;
		exports.sync_state();
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
