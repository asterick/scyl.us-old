import Exception from "./exception";

import { locate, compile, function_names, initialize as initialize_compiler } from "./instructions";
import { Exceptions, SYSTEM_CLOCK, MAX_COMPILE_SIZE, MIN_COMPILE_SIZE } from "./consts";

import { read as cedar_read, write as cedar_write } from "./cedar";
import { read as spu_read, write as spu_write } from "./spu";
import { read as dsp_read, write as dsp_write } from "./dsp";

import * as renderer from "./renderer";

import { 
	register_memory,
	set_blend_coff, set_texture, set_texture_mask, set_clut, set_dither, set_mask, 
	set_draw, 
	set_clip_pos, set_clip_size, 
	set_viewport_pos, set_viewport_size, 
	get_vram_data, set_vram_data, render 
} from "./renderer";

export { attach } from "./renderer";

export var regions = null;
export var running = false;
export var exports;

var adjust_clock;
var cache = [];

const _environment = {
	// GPU Rendering calls
	set_blend_coff, set_texture, set_texture_mask, set_clut, 
	set_draw, 
	set_clip_pos, set_clip_size, 
	set_viewport_pos, set_viewport_size, 
	set_dither, set_mask,
	get_vram_data, set_vram_data, render,

	// Accessors
	cedar_read, dsp_read, spu_read, 
	cedar_write, dsp_write, spu_write,

	// Stub to stop complaining
	debug: (x, l) => {
		const array = new Uint32Array(exports.memory.buffer, x, l / 4);
		const out = new Array(array.length);
		for (var i = 0; i < array.length; i++) out[i] = array[i];
		console.log(out.map(v => v.toString(16)).join(" "));
	},

	// Glue
	exception: (code, pc) => {
		throw new Exception(code, pc);
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

export function get_pc() {
	return exports.get_pc();
}

export function get_registers() {
	const memory = exports.memory.buffer;
	const utf8decode = new TextDecoder('utf-8');
	const dv = new DataView(memory);
	var address = exports.get_registers();

	var registers = [];
	
	for (;;) {
		var name_addr = dv.getUint32(address, true);
		address += 4;
		if (!name_addr) break ;

		var value = dv.getUint32(dv.getUint32(address, true), true);
		address += 4;

		for (var name_length = 0; dv.getUint8(name_addr + name_length, true); name_length++ ) ;

		const name = utf8decode.decode(memory.slice(name_addr, name_length + name_addr));
		
		registers.push({ name, value });
	}

	return registers;
}

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
	const new_clock = Date.now();
	exports.add_clock((new_clock - adjust_clock) * (SYSTEM_CLOCK / 1000));
	adjust_clock = new_clock;

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

	register_memory(exports.memory.buffer);	// to GPU

	return module;
}

// Execution core
export function reset() {
	cache = [];
	exports.reset();
}

// Execute a single frame
export function block_execute () {
	while (exports.get_clock()) {
		const start_pc = exports.get_pc();
		const block_size = exports.block_size(start_pc);
		const block_mask = -block_size; // equilivant to ~(block_size - 1)
		const physical = (exports.translate(start_pc, false, start_pc) & block_mask) >>> 0;
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
				exports.calculate_clock(e.pc);
				exports.trap(e.exception, e.pc);
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
		exports.step_execute();
	} catch (e) {
		if (e instanceof Exception) {
			exports.trap(e.exception, e.pc);
		} else {
			throw e;
		}
	}
}

export function load (word, pc) {
	return exports.load(word, pc);
}
