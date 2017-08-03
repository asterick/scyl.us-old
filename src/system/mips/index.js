import Exception from "./exception";
import locate from "./instructions";
import { REGS } from "./instructions/wast";
import { StepperDefintion } from "./instructions";

import { params } from "../../util";
import { MAX_COMPILE_SIZE, CLOCK_BLOCK, MIN_COMPILE_SIZE, PROCESSOR_ID, Exceptions } from "./consts";

const STATUS_CU3 = 0x80000000;
const STATUS_CU2 = 0x40000000;
const STATUS_CU1 = 0x20000000;
const STATUS_CU0 = 0x10000000;

const STATUS_RE	 = 0x02000000;	// Unsupported

const STATUS_BEV = 0x00400000;
const STATUS_TS	 = 0x00200000;	// Unlikely to be supported
const STATUS_PE	 = 0x00100000;	// Unsupported
const STATUS_CM	 = 0x00080000;	// Unsupported
const STATUS_PZ	 = 0x00040000;	// Unsupported
const STATUS_SwC = 0x00020000;	// Unsupported
const STATUS_IsC = 0x00010000;	// Unsupported

const STATUS_IM	 = 0x0000FF00;

const STATUS_KUo = 0x00000020;
const STATUS_IEo = 0x00000010;
const STATUS_KUp = 0x00000008;
const STATUS_IEp = 0x00000004;
const STATUS_KUc = 0x00000002;
const STATUS_IEc = 0x00000001;

const ALL_STATUS_BITS =
	STATUS_CU3 | STATUS_CU2 | STATUS_CU1 | STATUS_CU0 |
	STATUS_BEV | STATUS_IM |
	STATUS_KUo | STATUS_IEo | STATUS_KUp | STATUS_IEp | STATUS_KUc | STATUS_IEc;

function random() {
	return (Math.random() * 0x37 + 0x8) & 0x3F;
}

export default class MIPS {
	/*******
	 ** Runtime section
	 *******/
	constructor() {
		// Base functionality
		this.clock = 0;

		this._memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
		this.registers = new Uint32Array(this._memory.buffer);
		this.signed_registers = new Int32Array(this._memory.buffer);
		this.reset();

		// Status values
		this._status = STATUS_KUc | STATUS_BEV;
		this._cause = 0;
		this._epc = 0;

		// TLB
		this._entryLo = 0;
		this._entryHi = 0;
		this._badAddr = 0;
		this._ptBase = 0;
		this._index	= 0;

		this._tlbLo = new Uint32Array(64);
		this._tlbHi = new Uint32Array(64);
		this._tlb   = [];

		// Compiler cache
		this._cache = [];

		// Load in WASM definitions for step through memory
		this._setupStepper();
	}

	// Helper values for the magic registers
	get pc() {
		return this.registers[REGS.PC];
	}

	set pc(v) {
		this.registers[REGS.PC] = v;
	}

	get lo() {
		return this.registers[REGS.LO];
	}

	set lo(v) {
		this.registers[REGS.LO] = v;
	}

	get hi() {
		return this.registers[REGS.HI];
	}

	set hi(v) {
		this.registers[REGS.HI] = v;
	}

	reset() {
		this.pc = 0xBFC00000;
		this._status = STATUS_KUc | STATUS_BEV;
		this._cause = 0;
	}

	// Setup WebAssembly for stepper
	_setupStepper () {
		WebAssembly.instantiate(StepperDefintion, {
			processor: {
				memory: this._memory,
		        exception: (code, pc, delayed, cop) => { throw new Exception(code, pc, delayed, cop) },
				delay_execute: (pc) => this._execute(pc, true),
		    	load: (address, pc, delayed) => this.load(address, pc, delayed),
		    	store: (address, value, mask, pc, delayed) => this.store(address, value, mask, pc, delayed),
		    	mfc0: (reg, pc, delayed) => this._mfc0(reg, pc, delayed),
		    	mtc0: (reg, word, pc, delayed) => this._mtc0(reg, word, pc, delayed),
		    	rfe: (pc, delayed) => this._rfe(pc, delayed),
		    	tlbr: (pc, delayed) => this._tlbr(pc, delayed),
		    	tlbwi: (pc, delayed) => this._tlbwi(pc, delayed),
		    	tlbwr: (pc, delayed) => this._tlbwr(pc, delayed),
		    	tlbp: (pc, delayed) => this._tlbp(pc, delayed),
			}
		}).then((result) => {
			this._wasmDefs = result.instance.exports;
		});
	}

	// Execute a single frame
	_tick (ticks) {
		const time = ticks * CLOCK_BLOCK;
		while (this.clock < time) {
			const block_size = this._blockSize(this.pc);
			const block_mask = ~(block_size - 1);
			const physical = (this._translate(this.pc, false) & block_mask) >>> 0;
			const logical = (this.pc & block_mask) >>> 0;

			var funct = this._cache[physical];

			if (funct === undefined || !funct.code || funct.logical !== logical) {
				// TODO: BUILD FUNCTION HERE

				for (let start = physical; start < physical + block_size; start += MIN_COMPILE_SIZE) {
					this._cache[start] = funct;
				}
			}

			try {
				this._interrupt();
				funct.code(Exception, this, time);
			} catch (e) {
				this._trap(e);
			}
		}

		// Advance our clock
		this.clock -= CLOCK_BLOCK;
	}

	step () {
		this._interrupt();

		try {
			var pc = this.pc;
			this.pc += 4;

			this._execute(pc, false);
		} catch (e) {
			this._trap(e);
		}
	}

	load (logical, pc, delayed) {
		try {
			return this.read(false, this._translate(logical, false));
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	}

	store (logical, value, mask, pc, delayed) {
		try {
			const physical = this._translate(logical, true);
			this.write(physical, value, mask);

			// Invalidate cache line
			const entry = this._cache[physical & ~(this._blockSize(logical) - 1)];

			if (entry) {
				// Clear this row out (de-reference the function so we don't leak)
				entry.code = null;
			}
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	}

	readSafe(address) {
		if (address & 0xC0000000 !== 0x80000000) {
			let page = address & 0xFFFFF000;
			let result = this._tlb[page | (this._entryHi & 0xFC0)] || this._tlb[page | 0xFFF];

			if (~result & 0x0200) {
				throw "TLB MISS";
			}

			return this.read(true, ((result & 0xFFFFF000) | (address & 0x00000FFF)) >>> 0);
		} else {
			return this.read(true, address & 0x1FFFFFFC);
		}
	}

	// This forces delay slots at the end of a page to
	// be software interpreted so TLB changes don't
	// cause cache failures
	_execute(pc, delayed) {
		const physical = this._translate(pc, false);
		const data = this.load(physical, pc, delayed);
		const call = locate(data);

		this._wasmDefs[call.name](data, pc, delayed);
	}

	_blockSize(address) {
		if (address & 0xC0000000 !== 0x80000000) {
			return MIN_COMPILE_SIZE;
		} else {
			return Math.min(MAX_COMPILE_SIZE, this.blockSize(address & 0x1FFFFFFC) || MIN_COMPILE_SIZE);
		}
	}

	/*******
	 ** COP0 section
	 *******/
	_copEnabled(cop) {
		return (((this._status >> 18) | ((this._status & STATUS_KUc) ? 1 : 0)) >>> cop) & 1;
	}

	interrupt(i) {
		this._status |= (1 << (i + 8)) & STATUS_IM;
	}

	_interrupt() {
		// Pending interrupts?
		if (this._status & STATUS_IEc && this._cause & this._status & STATUS_IM) {
			this._trap(new Exception(Exceptions.Interrupt, this.pc, false));
		}
	}

	_mfc0(reg, pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		switch (reg) {
		// Random registers
		case 0xF: // c0_prid
			return PROCESSOR_ID;

		// Virtual-memory registers
		case 0x0: // c0_index
			return this._index;
		case 0x1: // c0_random (non-deterministic, cheap method)
			return random() << 8;
		case 0x2: // c0_entrylo
			return this._entryLo;
		case 0xA: // c0_entryhi
			return this._entryHi;
		case 0x4: // c0_context
			return this._ptBase |
				((this._badAddr & 0xFFFFF800) >> 11);
		case 0x8: // c0_vaddr
			return this._badAddr;

		// Status/Exception registers
		case 0xC: // c0_status
			return this._status;
		case 0xD: // c0_cause
			return this._cause;
		case 0xE: // c0_epc
			return this._epc;
		default:
			return 0;
		}
	}

	_mtc0(reg, word, pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		switch (reg) {
		// Virtual-memory registers
		case 0x0: // c0_index
			this._index = word & 0x3F00;
			break ;
		case 0x2: // c0_entrylo
			this._entryLo = word & 0xFFFFFFC0;
			break ;
		case 0xA: // c0_entryhi
			this._entryHi = word & 0xFFFFFF00;
			break ;
		case 0x4: // c0_context
			this._ptBase = word & 0xFFE00000;
			break ;

		// Status/Exception registers
		case 0xC: // c0_status
			this._status = word & ALL_STATUS_BITS;
			break ;
		case 0xD: // c0_cause
			this._cause = (this._cause & ~0x0000FF00) | (word & 0x0000FF00);
			break ;
		}
	}

	_translate(address, write) {
		let cached = true;
		if (address & 0x8000000 && ~this._status & STATUS_KUc) {
			throw Exceptions.CoprocessorUnusable;
		}

		if (address & 0xE0000000 === 0xA0000000) {
			cached = false;
		}

		if (address & 0xC0000000 !== 0x80000000) {
			let page = address & 0xFFFFF000;
			let result = this._tlb[page | (this._entryHi & 0xFC0)] || this._tlb[page | 0xFFF];

			cached = ~result & 0x0800;

			// TLB line is inactive
			if (~result & 0x0200) {
				this._badAddr = address;
				this._entryHi = (this._entryHi & ~0xFFFFF000) | (address & 0xFFFFF000);
				throw write ? Exceptions.TLBStore : Exceptions.TLBLoad;
			}

			// Writes are not permitted
			if (write && ~result & 0x0400) {
				this._badAddr = address;
				this._entryHi = (this._entryHi & ~0xFFFFF000) | (address & 0xFFFFF000);
				throw Exceptions.TLBMod;
			}

			return ((result & 0xFFFFF000) | (address & 0x00000FFF)) >>> 0;
		} else {
			return address & 0x1FFFFFFC;
		}
	}

	_writeTLB(index) {
		// Ignore TLB entries that can cause a collision (normally would cause a system reset)
		if (this._tbl[this._entryHi] || this._tlb[this._entryHi | 0xFFF]) {
			return ;
		}

		// Clear out previous TLB element (if it was valid)
		if (this._tlbLo[index] & 0x200) {
			let indexWas = this._tlbHi[index] | ((this._tlbLo[index] & 0x100) ? 0xFFF : 0);
			delete this._tlb[indexWas];
		}

		// Setup our fast lookup
		if (this._entryLo & 0x200) {
			let indexIs = this._entryHi | ((this._entryLo & 0x100) ? 0xFFF : 0);
			this._tlb[indexIs]  = this._entryLo | index;
		}

		// Store our TLB (does not handle global)
		this._tlbLo[index] = this._entryLo;
		this._tlbHi[index] = this._entryHi;
	}

	_tlbr(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		this._entryLo = this._tlbLo[(this._index >> 8) & 0x3F];
		this._entryHi = this._tlbHi[(this._index >> 8) & 0x3F];
	}

	_tlbp(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		let found = this._tbl[this._entryHi] || this._tlb[this._entryHi | 0xFFF];

		if (found & 0x200) {
			this._index = (found & 0x3F) << 8;
		} else {
			this._index |= 0x80000000;
		}
	}

	_tlbwi(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		this._writeTLB((this._index >> 8) & 0x3F, pc, delayed);
	}

	_tlbwr(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		this._writeTLB(random(), pc, delayed);
	}

	// Exception logic
	_rfe(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Exceptions.CoprocessorUnusable, pc, delayed, 0);
		}

		this._status = (this._status & ~0xF) | ((this._status >> 2) & 0xF);
	}

	_trap(e) {
		// Bubble up exceptions that are not execution errors
		if (!(e instanceof Exception)) {
			throw e;
		}

		// Preserve return address
		this._epc = e.pc;

		// Enter kernal mode, and shift the mode flags
		this._status = (this._status & ~ 0x3F) | ((this._status << 2) & 0x3C) | STATUS_KUc;

		// Set our cause register
		this._cause = (this._cause & 0x0000FF00) |
			(e.delayed ? 0x80000000 : 0) |
			(e.coprocessor << 28) |
			(e.exception << 2);

		switch (e.exception) {
		case Exceptions.TLBLoad:
		case Exceptions.TLBStore:
			this.pc = (this._status & STATUS_BEV) ? 0xbfc00100 : 0x80000000;
			break ;

		default:
			this.pc = (this._status & STATUS_BEV) ? 0xbfc00180 : 0x80000080;
			break ;
		}
	}
}
