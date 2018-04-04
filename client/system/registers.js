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

	static get pc() {
		return registers[16];
	}

	static set pc(v) {
		registers[16] = v;
	}

	static get clocks() {
		return registers[0] >> 0;
	}

	static set clocks(v) {
		registers[0] = v;
	}
}
