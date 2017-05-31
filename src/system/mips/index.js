import Exception from "./exception";
import { Exceptions } from "./consts";

import locate from "./instructions";
import { params } from "../../util";
import { MAX_LOOPS } from "./consts";

export default class MIPS {
	constructor() {
		this.clock = 0;
		this.hi = 0;
		this.lo = 0;
		this.pc = 0xBFC00000;

		this.registers = new Uint32Array(32);
		this.signed_registers = new Int32Array(this.registers.buffer);
	}

	_evaluate (pc, delayed, execute) {
		const op = locate(this.read_code(pc));

		const fields = op.instruction.fields.map((f) => {
			switch (f) {
			case 'pc':
				return pc;
			case 'delayed':
				return delayed;
			case 'delay':
				return () => this._evaluate(pc + 4, true, execute);
			default:
				if (op[f] === undefined) {
					throw new Error(`BAD FIELD ${f}`);
				}
				return op[f];
			}
		});

		return execute(op, fields);
	}

	_compile (start, end) {
		const build = (op, fields) => "that.clock++;" + op.instruction.template(... fields);
		const lines = [];

		for (var address = start; address <= end; address += 4) {
			lines.push(`case 0x${address.toString(16)}: ${this._evaluate(address, false, build)}`);
		}

		var funct = new Function("Exception", `return function (that) {
			for(var loop_counter = ${MAX_LOOPS}; loop_counter >= 0; loop_counter--) {
				switch (that.pc) {
					\n${lines.join("\n")}
					this.pc = 0x${(end >>> 0).toString(16)};
				default:
					return ;
				}
			}
		}`).call(Exception);

		funct.start = start;
		funct.end = end;
		funct.valid = true;

		return funct;
	}

	_execute (pc) {
	 	this.clock++;
		const ret_addr = this._evaluate(pc, false, (op, fields) => op.instruction.apply(this, fields));

		if (ret_addr !== undefined) {
			this.pc = ret_addr;
		} else {
			this.pc = (this.pc + 4) >>> 0;
		}
	}

	_trap(e) {
		// TODO: Trap to COP0
	}

	run () {
		try {
			// TODO: CACHE SUPPORT
			// Note: if a write invalidates at the bottom of a cache page, it should also invalidate the previous page
			// to handle delay branch pitfalls
			this._compile(this.pc)(this);
		} catch (e) {
			this._trap(e);
		}
	}

	step () {
		try {
			this._execute(this.pc);
		} catch (e) {
			this._trap(e);
		}
	}

	disassemble (pc) {
		const word = this.read_code(pc);
		const op = locate(word);

		if (!op.instruction.assembly.fields) {
			op.instruction.assembly.fields = params(op.instruction.assembly);
		}

		const fields = op.instruction.assembly.fields.map((f) => {
			switch (f) {
			case 'pc':
				return pc;
			default:
				return op[f];
			}
		});

		const code = op.instruction.assembly(...fields);

		return { word, code };
	}
}
