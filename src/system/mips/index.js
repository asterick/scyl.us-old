import Exception from "./exception";
import locate from "./instructions";

import { params } from "../../util";
import { MAX_LOOPS, PROCESSOR_ID, Exceptions } from "./consts";

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
		this.hi = 0;
		this.lo = 0;
		this.pc = 0xBFC00000;

		this.registers = new Uint32Array(32);
		this.signed_registers = new Int32Array(this.registers.buffer);

		// COP0 Reset
		// Status values
		this._status = STATUS_KUc | STATUS_BEV;
		this._cause = 0;
		this._epc = 0;

		// TLB
		this._entryLo = 0;
		this._entryHi = 0;
		this._badAddr = 0;
		this._targetAddr = 0;
		this._ptBase = 0;
		this._index	= 0;

		this._tlbLo = new Uint32Array(64);
		this._tlbHi = new Uint32Array(64);
		this._tlb   = [];
	}

	load (address, pc, delayed) {
		try {
			return this.read(this._translate(address, false));
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	}

	store (address, value, mask, pc, delayed) {
		try {
			this.write(this._translate(address, true), value, mask);
		} catch (e) {
			throw new Exception(e, pc, delayed, 0);
		}
	}

	_evaluate (pc, delayed, execute) {
		const op = locate(this.read(pc));

		const fields = op.instruction.fields.map((f) => {
			switch (f) {
			case 'pc':
				return pc;
			case 'delayed':
				return delayed;
			case 'delay':
				return () => this._evaluate(pc + 4, true, execute);
			default:
				if (op[f] === undefined) {
					throw new Error(`BAD FIELD ${f}`);
				}
				return op[f];
			}
		});

		return execute(op, fields);
	}

	_compile (physical, start, length) {
		const build = (op, fields) => "that.clock++;" + op.instruction.template(... fields);
		const lines = [];
		const end = start + length;

		for (var i = 0; i < length; i += 4) {
			lines.push(`case 0x${(start + i).toString(16)}: ${this._evaluate(physical + i, false, build)}`);
		}

		var funct = new Function("Exception", `return function (that) {
			for(var loop_counter = ${MAX_LOOPS}; loop_counter >= 0; loop_counter--) {
				switch (that.pc) {
					\n${lines.join("\n")}
					that.pc = 0x${(end >>> 0).toString(16)};
				default:
					return ;
				}
			}
		}`).call(Exception);

		funct.physical = physical;
		funct.start = start;
		funct.end = end;
		funct.valid = true;

		return funct;
	}

	_execute (pc) {
	 	this.clock++;
		const physical = this._translate(this.pc, false);
		const ret_addr = this._evaluate(physical, false, (op, fields) => op.instruction.apply(this, fields));

		if (ret_addr !== undefined) {
			this.pc = ret_addr;
		} else {
			this.pc = (this.pc + 4) >>> 0;
		}
	}

	run () {
		try {
			// TODO: CACHE SUPPORT
			// Note: if a write invalidates at the bottom of a cache page, it should also invalidate the previous page
			// to handle delay branch pitfalls
			const physical = this._translate(this.pc, false);

			this._compile(physical, this.pc, 4096)(this);
		} catch (e) {
			this._trap(e);
		}
	}

	step () {
		try {
			this._execute(this.pc);
		} catch (e) {
			this._trap(e);
		}
	}

	/*******
	 ** COP0 section
	 *******/
	_copEnabled(cop) {
		return (((this._status >> 18) | ((this._status & STATUS_KUc) ? 1 : 0)) >>> cop) & 1;
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
			this._targetAddr = address; // Holding register, trap will copy this to _badAddr if something goes wrong

			if (~result & 0x0200) {
				throw write ? Exceptions.TLBStore : Exceptions.TLBLoad;
			}

			if (~result & 0x0400 && write) {
				throw Exceptions.TLBMod;
			}

			return (result & 0xFFFFF000) | (address & 0x00000FFF);
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

		// THIS IS NOT FULLY FLESHED OUT
		switch (e.exception) {
		case Exceptions.TLBLoad:
		case Exceptions.TLBStore:
			this._badAddr = this._targetAddr;
			this._entryHi = (this._entryHi & ~0xFFFFF000) | (this._targetAddr & 0xFFFFF000);

			this.pc = (this._status & STATUS_BEV) ? 0xbfc00100 : 0x80000000;
			break ;

		case Exceptions.TLBMod:
			this._badAddr = this._targetAddr;
			this._entryHi = (this._entryHi & ~0xFFFFF000) | (this._targetAddr & 0xFFFFF000);

		case Exceptions.Interrupt:
		case Exceptions.AddressLoad:
		case Exceptions.AddressStore:
		case Exceptions.BusErrorInstruction:
		case Exceptions.BusErrorData:
		case Exceptions.SysCall:
		case Exceptions.Breakpoint:
		case Exceptions.ReservedInstruction:
		case Exceptions.CoprocessorUnusable:
		case Exceptions.Overflow:
			this.pc = (this._status & STATUS_BEV) ? 0xbfc00180 : 0x80000080;
			break ;
		}
	}
}
