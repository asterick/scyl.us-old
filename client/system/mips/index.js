import Exception from "./exception";
import { locate, Compiler } from "./instructions";

import { MAX_COMPILE_SIZE, MIN_COMPILE_SIZE, Exceptions } from "./consts";

export default class MIPS {
	/*******
	 ** Runtime section
	 *******/
	constructor() {
		// Compiler cache
		this._cache = [];

		this._environment = {
	        exception: (code, pc, delayed, cop) => { throw new Exception(code, pc, delayed, cop); },
			execute: (pc, delayed) => this._execute(pc, delayed),
	    	read: (physical, code, pc, delayed) => {
				try {
					return this.read(code, physical >>> 0);
				} catch (e) {
					throw new Exception(e, pc, delayed, 0);
				}
	    	},
	    	write: (physical, value, mask, pc, delayed) => {
				try {
					this.write(physical, value, mask);
				} catch (e) {
					throw new Exception(e, pc, delayed, 0);
				}
			},
	    	invalidate: (physical, logical) => {
				// Invalidate cache line
				const cache_line = physical & ~(this._blockSize(logical) - 1);
				const entry = this._cache[cache_line];

				// Clear this row out (de-reference the function so we don't leak)
				if (entry) {
					entry.code = null;
					this._cache[cache_line] = null;
				}
	    	}
    	};

		// Load in WASM definitions for step through memory
		fetch("core.wasm")
			.then((blob) => blob.arrayBuffer())
			.then((ab) => {
				this._compiler = new Compiler(ab);

				return WebAssembly.instantiate(ab, {
					env: this._environment
				});
			})
			.then((module) => {
				this._exports =  module.instance.exports;

				const memory = this._exports.memory.buffer;

				this.registers = new Uint32Array(memory, this._exports.getRegisterAddress(), 64);
				this.load = this._exports.load;
				this.store = this._exports.store;
				this.copEnabled = this._exports.copEnabled;
				this.translate = this._exports.translate;
				this.interrupt = this._exports.interrupt;
				this.handle_interrupt = this._exports.handle_interrupt;
				this.trap = this._exports.trap;

				this.reset();
				this.onReady && this.onReady();
			});
	}

	// Helper values for the magic registers
	get pc() {
		return this._exports.getPC() >>> 0;
	}

	set pc(v) {
		this._exports.setPC(v);
	}

	get lo() {
		return this._exports.getLO() >>> 0;
	}

	get hi() {
		return this._exports.getHI() >>> 0;
	}

	get clocks() {
		return this._exports.getClocks() >> 0;
	}

	// Execution core
	reset() {
		this.timer = 0;

		this._exports.reset();
	}

	// Execute a single frame
	_tick (ticks) {
		// Advance clock, with 0.1 sec a max 'lag' time
		const _prev = this._exports.addClocks(ticks);

		while (this.clocks > 0) {
			const block_size = this._blockSize(this.pc);
			const block_mask = ~(block_size - 1);
			const physical = (this.translate(this.pc, false, this.pc, false) & block_mask) >>> 0;
			const logical = (this.pc & block_mask) >>> 0;

			var funct = this._cache[physical];

			if (funct === undefined || !funct.code || funct.logical !== logical) {
				const defs = this._compiler.compile(logical, block_size / 4, (address) => {
					// Do not assemble past block end (fallback to intepret)
					if (address >= logical + block_size) {
						return null;
					}

					try {
						var word = this.load(address);
						return locate(word);
					} catch(e) {
						// There was a loading error, fallback to interpret
						return null;
					}
				});

				WebAssembly.instantiate(defs, {
					env: this._environment,
					core: this._exports
				}).then((result) => {
					const funct = {
						code: result.instance.exports.block,
						logical: logical
					};

					for (let start = physical; start < physical + block_size; start += MIN_COMPILE_SIZE) {
						this._cache[start] = funct;
					}

					// Resume execution after the JIT core completes
					this.tick();
				});

				// Execution has paused, waiting for compiler to finish
				return false;
			}

			try {
				funct.code();
			} catch (e) {
				if (e instanceof Exception) {
					this.trap(e.exception, e.pc, e.delayed, e.coprocessor)
				} else {
					throw e;
				}
			}
		}

		this.timer += _prev - this.clocks;
		this.handle_interrupt();
		return true;
	}

	step () {
		const _prev = this.clocks;

		try {
			var pc = this.pc;
			this.pc += 4;

			this._execute(pc, false);
		} catch (e) {
			if (e instanceof Exception) {
				this.trap(e.exception, e.pc, e.delayed, e.coprocessor)
			} else {
				throw e;
			}
		}

		this.timer += _prev - this.clocks;
		this.handle_interrupt();
	}

	// This forces delay slots at the end of a page to
	// be software interpreted so TLB changes don't
	// cause cache failures
	_execute(pc, delayed) {
		const data = this.load(pc, true, pc, delayed);
		const call = locate(data);

		this._exports[call.name](pc, data, delayed);
	}

	_blockSize(address) {
		if ((address & 0xC0000000) !== (0x80000000 >> 0)) {
			return MIN_COMPILE_SIZE;
		} else if (address >= 0x1FC00000 && address < 0x1FC80000) {
			return MAX_COMPILE_SIZE;
		} else {
			return MIN_COMPILE_SIZE;
		}
	}
}
