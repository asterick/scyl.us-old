import MIPS from "./mips";

import * as Instructions from "./mips/instructions";

export default class Playstation extends MIPS {
	constructor (bios) {
		super();
	}

	attach (canvas) {
	}

	resize() {
	}

	trap(e) {
		// TODO: Trap to COP0
		this.clock++;
		console.error("SYSTEM EXCEPTION:", e)
	}

	read (address) {

	}

	write (address, value, mask = ~0) {
		// Invalidate memory regions
		this._invalidate(address << 2);
	}

	// === COP0 Bindings ===
	read_cop0(register, pc, delayed) {
	}

	write_cop0(register, value, pc, delayed) {
	}

	rte() {
		// TODO
	}
}
