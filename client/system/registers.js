import { registers } from ".";

// Helper values for the magic registers
export default class Registers {
	/**
	 Register mapping:
	 ** 32: lo
	 ** 33: hi
	 ** 34: pc
	 ** 35: start_pc
	 ** 36: clocks (int)
	 **/

	static get lo() {
		return registers[32];
	}

	static get hi() {
		return registers[33];
	}

	static get pc() {
		return registers[34];
	}

	static set pc(v) {
		registers[34] = v;
	}

	static get clocks() {
		return registers[35] >> 0;
	}

	static set clocks(v) {
		registers[35] = v;
	}
}
