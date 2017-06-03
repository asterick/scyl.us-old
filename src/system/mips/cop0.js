import { PROCESSOR_ID } from "./consts";

function random() {
	return (Math.random() * 0x37 + 0x8) & 0x3F;
}

export default class {
	constructor() {
		// Status values
		this._Kernel  = true;

		// TLB
		this._entryLo = 0;
		this._entryHi = 0;

		this._badAddr = 0;

		this._ptBase = 0;
		this._index	= 0;
		this._asid = 0;

		this._tlbN = false;
		this._tlbD = false;
		this._tlbV = false;
		this._tlbG = false;

		this._tlbLo = new Uint32Array(64);
		this._tlbHi = new Uint32Array(64);
		this._tlb   = [];
	}

	_mfc0(reg) {
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
		case 0xD: // c0_cause
		case 0xE: // c0_epc
		default:
			return 0;
		}
	}

	_mtc0(reg, word) {
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
		}
	}

	_translate(address, write) {
		let cached = true;
		if (address & 0x8000000) {
			// TODO: VALIDATE USER IS KERNEL
		}

		if (address & 0xE0000000 === 0xA0000000) {
			cached = false;
		}

		if (address & 0xC0000000 !== 0x80000000) {
			let page = address & 0xFFFFF000;
			let result = this._tlb[page | (this._entryHi & 0xFC0)] || this._tlb[page | 0xFFF];

			cached = ~result & 0x0800;

			if (~result & 0x0200) {
				// TODO: THROW TLB MISS
			}

			if (~result & 0x0400 && write) {
				// TODO: THROW MOD EXCEPTION
			}

			return (result & 0xFFFFF000) | (address & 0x00000FFF);
		} else {
			return address & 0x1FFFFFFC;
		}
	}

	_tlbr() {
		this._entryLo = this._tlbLo[(this._index >> 8) & 0x3F];
		this._entryHi = this._tlbHi[(this._index >> 8) & 0x3F];
	}

	_writeTLB(index) {
		if (this._tbl[this._entryHi] || this._tlb[this._entryHi | 0xFFF]) {
			// Ignore TLB entries that can cause a collision
			return ;
		}

		// Clear out previous TLB element (if it was valid)
		if (this._tlbLo[index] & 0x200) {
			let indexWas = this._tlbHi[index] | ((this._tlbLo[index] & 0x100) ? 0xFFF : 0);
			this._tlb[indexWas] = 0;
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

	_tlbwi() {
		this._writeTLB((this._index >> 8) & 0x3F);
	}

	_tlbwr() {
		this._writeTLB(random());
	}

	_tlbp() {
		let found = this._tbl[this._entryHi] || this._tlb[this._entryHi | 0xFFF];

		if (found & 0x200) {
			this._index = (found & 0x3F) << 8;
		} else {
			this._index |= 0x80000000;
		}
	}

	// Exception logic
	_trap(e) {
		// TODO: Trap to COP0
		throw e;
	}

	_rte() {

	}


}
