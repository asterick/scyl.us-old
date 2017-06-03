import { PROCESSOR_ID, Exceptions } from "./consts";
import Exception from "./exception";

// NOTE: I use a system random number generator instead of the clock counter
// as this approach is faster and users should NOT depend on specific implementation
// for how this works

// NOTE: COP0 should be using the enable flags in _status, not test the kernel flag

const STATUS_CU3 = 0x80000000;
const STATUS_CU2 = 0x40000000;
const STATUS_CU1 = 0x20000000;
const STATUS_CU0 = 0x10000000;

const STATUS_RE	 = 0x02000000;

const STATUS_BEV = 0x00400000;
const STATUS_TS	 = 0x00200000;
const STATUS_PE	 = 0x00100000;
const STATUS_CM	 = 0x00080000;
const STATUS_PZ	 = 0x00040000;
const STATUS_SwC = 0x00020000;
const STATUS_IsC = 0x00010000;

const STATUS_IM	 = 0x0000FF00;

const STATUS_KUo = 0x00000020;
const STATUS_IEo = 0x00000010;
const STATUS_KUp = 0x00000008;
const STATUS_IEp = 0x00000004;
const STATUS_KUc = 0x00000002;
const STATUS_IEc = 0x00000001;

function random() {
	return (Math.random() * 0x37 + 0x8) & 0x3F;
}

export default class {
	resetCOP0() {
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

	_copEnabled(cop) {
		return (((this._status >> 18) | ((this._status & STATUS_KUc) ? 1 : 0)) >>> cop) & 1;
	}

	_mfc0(reg, pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
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
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
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
		case 0xD: // c0_cause
			// TODO
		}
	}

	_translate(address, write) {
		let cached = true;
		if (address & 0x8000000 && ~this._status & STATUS_KUc) {
			throw Const.Exceptions.CoprocessorUnusable;
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
				throw write ? Const.Exceptions.TLBStore : Const.Exceptions.TLBLoad;
			}

			if (~result & 0x0400 && write) {
				throw Const.Exceptions.TLBMod;
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
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
		}

		this._entryLo = this._tlbLo[(this._index >> 8) & 0x3F];
		this._entryHi = this._tlbHi[(this._index >> 8) & 0x3F];
	}

	_tlbp(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
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
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
		}

		this._writeTLB((this._index >> 8) & 0x3F, pc, delayed);
	}

	_tlbwr(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
		}

		this._writeTLB(random(), pc, delayed);
	}

	// Exception logic
	_trap(e) {
		// TODO: Trap to COP0
		throw e;
	}

	_rfe(pc, delayed) {
		if (!this._copEnabled(0)) {
			throw new Exception(Const.Exceptions.CoprocessorUnusable, pc, delayed);
		}

		this._status = (this._status & ~0xF) | ((this._status >> 2) & 0xF);
	}
}
