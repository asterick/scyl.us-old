import MIPS from "./mips";

import * as Instructions from "./mips/instructions";

export default class Playstation extends MIPS {
	constructor (bios) {
		super();

		this._compile(this.pc, this.pc + 32);
	}

	attach (canvas) {
	}

	resize() {
	}

	read_code (address) {
		return (address & 4) ? 0x00000000 : 0x08000000;
	}

	read (address) {
		return 0;
	}

	write (address, value, mask = ~0) {
	}

	// === COP0 Bindings ===
	read_cop0(register) {
	}

	write_cop0(register, value) {
	}

	rte() {
		// TODO
	}
}
