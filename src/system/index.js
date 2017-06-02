import MIPS from "./mips";

export default class extends MIPS {
	constructor (bios) {
		super();
	}

	attach (canvas) {
		// TODO
	}

	read (address) {
		return 0;
	}

	write (address, value, mask = ~0) {
	}
}
