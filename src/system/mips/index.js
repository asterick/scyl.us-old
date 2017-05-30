import Exception from "./exception";

import { locate } from "./table";
import { params } from "../../util";

export default class MIPS {
	constructor() {
		this._cache = new Array();

		this.clock = 0;
		this.hi = 0;
		this.lo = 0;
		this.pc = 0xBFC00000;

		this.registers = new Uint32Array(32);
		this.signed_registers = new Int32Array(this.registers.buffer);
	}

	_fields (op, pc, build, delayed) {
		return op.instruction.fields.map((f) => {
			switch (f) {
			case 'pc':
				return pc;
			case 'delayed':
				return delayed;
			case 'delay':
				return (pc) => build(pc + 4, true);
			default:
				if (op[f] === undefined) throw new Error(`BAD FIELD ${f}`);
				return op[f];
			}
		});
	}

	_invalidate (addr) {
		const base = address & 0xF0000000;

		this._cache[base] && (this._cache[base].valid = false);
		this._cache[base | 0x80000000] && (this._cache[base | 0x80000000].valid = false);
		this._cache[base | 0xA0000000] && (this._cache[base | 0xA0000000].valid = false);
	}

	_compile (pc) {
		if (this._cache[pc] && this._cache[pc].valid) {
			return this._cache[pc];
		}

		var terminate = false;

		const build = (pc, delayed = false) => {
			const op = locate(this.read(pc));

			if (!op) {
				terminate = true;
				return `throw new Exception(${Exceptions.ReservedInstruction}, ${pc}, ${delayed})`;
			}

			const fields = this._fields(op, pc, build, delayed);

			terminate = terminate || op.instruction.terminates;
			return `${op.instruction.template(... fields)} this.clock++;`;
		}

		const lines = [];
		var address = pc;
		var op;

		do {
			try {
				lines.push(`case 0x${address.toString(16)}: ${build(address)}`);
				address += 4;
			} catch (e) {
				break ;
			}
		} while(!terminate);

		var funct = new Function("Exception", `
			for(var i = 0; i < 5; i++) {
				switch (this.pc) {
				${lines.join("\n")}
					this.pc = ${address};
				default:
					return ;
				}
			}
		`);

		funct.start = pc;
		funct.tail = address;
		funct.valid = true;

		while (pc < address) {
			this._cache[pc++] = funct;
		}

		return funct;
	}

	_execute (pc, delayed = false) {
		const op = locate(this.read(pc));

		if (!op) {
			throw new Exception(Exceptions.ReservedInstruction, pc, delayed);
		}

		const fields = this._fields(op, pc, (pc) => this._execute(pc, true), delayed);
		const ret_addr = op.instruction.apply(this, fields);
	 	this.clock++;

		if (ret_addr !== undefined) {
			this.pc = ret_addr;
		} else {
			this.pc = (this.pc + 4) >>> 0;
		}
	}

	run () {
		try {
			this._compile(this.pc).call(this, Exception);
		} catch (e) {
			this.trap(e);
		}
	}

	step () {
		try {
			this._execute(this.pc);
		} catch (e) {
			this.trap(e);
		}
	}

	disassemble (pc) {
		try {
			const word = this.read(pc);
			const op = locate(word);

			if (!op) return { word };

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
		} catch (e) {
			return null;
		}
	}
}
