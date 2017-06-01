import MIPS from "./mips";

export default class extends MIPS {
	constructor (bios) {
		super();

		this._compile(this.pc, this.pc + 32);
	}

	attach (canvas) {
		// TODO
	}

	// This is the non-volatile code space (RAM/ROM)
	read_code (address) {
		return address & 4 ? 0x08000000 : 0xFF000000;
	}

	read (address) {
		return this.read_code(address);
	}

	write (address, value, mask = ~0) {
	}
}
