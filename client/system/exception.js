import { ExceptionNames } from "./consts";

export default class {
	constructor(exception, pc) {
		this.exception = exception;
		this.pc = pc;
	}

	toString() {
		return `Exception${this.exception}: ${ExceptionNames[this.exception]} at 0x${this.pc.toString(16)}`;
	}

	get name() { return ExceptionNames[this.exception]; }
}
