import MIPS from "./mips";

export default class extends MIPS {
	constructor (bios) {
		super();

		this._compile(this.pc, this.pc + 32);
	}

	attach (canvas) {
		// TODO
	}

	resize() {
	}

	// Helper function for reading from code space (prevent compiler from trashing strobe regs)
	read_code (address) {
		return 0xFF000000;
	}

	read (address) {
		return this.read_code(address);
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
