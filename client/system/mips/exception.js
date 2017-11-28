import { ExceptionNames } from "./consts";

export default class {
	constructor(exception, pc, delayed, coprocessor) {
		this.exception = exception;
		this.pc = pc;
		this.delayed = delayed;
		this.coprocessor = coprocessor;
	}

	toString() {
		return `Exception${this.exception}: ${ExceptionNames[this.exception]} at 0x${this.pc.toString(16)}${this.delayed ? " delayed" : ""}`;
	}

	get name() { return ExceptionNames[this.exception]; }
}
