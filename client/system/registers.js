import { registers } from ".";

// Helper values for the magic registers
export default class Registers {
	/**
	 Register mapping:
	 ** 32: start_pc
	 ** 33: clocks (int)
	 **/

	static set pc(v) {
		registers[32] = v;
	}

	static get clocks() {
		return registers[33] >> 0;
	}

	static set clocks(v) {
		registers[33] = v;
	}
}
