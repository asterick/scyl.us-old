import { ExceptionNames } from "./consts";

export default class Exception {
	constructor(exception, pc, delayed) {
		this.exception = exception;
		this.pc = pc;
		this.delayed = delayed;
	}

	get name() { return ExceptionNames[this.exception]; }
}
