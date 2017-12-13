import { Fields } from "./fields";
import { Disassembly, Instructions } from "./table";

import Export from "../../dynast/export";
import Import from "../../dynast/import";

// WARNING: This can possibly cause call stack to overflow, depending on how
// large an instruction chain is, may have to use trampolines later

function names(table) {
	return Object.keys(table).reduce((acc, key) => {
		const entry = table[key];
		if (typeof entry === 'string') {
			return (key !== 'field') ? acc.concat(entry) : acc;
		} else {
			return acc.concat(names(entry));
		}
	}, []);
}

export class Compiler {
	constructor(ab) {
		const defs = Import(ab);

		// Validate
		const exported_functions =
			defs.export_section.filter((v) => v.kind === 'func_type').length;
		const imported_functions =
			defs.import_section.filter((v) => v.type.type === 'func_type').length;

		if (exported_functions !== defs.function_section.length) {
			throw new Error("Core module cannot contain private functions");
		}

		this._import_section = defs.import_section.concat(
			defs.export_section.map((i) => {
				switch (i.kind) {
				case 'memory_type':
					return {
	            			"module": "core",
	            			"field": i.field,
	            			"type": defs.memory_section[i.index]
	            		};
	            case 'func_type':
					return {
	            			"module": "core",
	            			"field": i.field,
	            			"type": defs.function_section[i.index - imported_functions].type
	            		};
	            default:
	            	throw new Error(`Cannot import ${i.kind}`);
	            }
			})
		);

		this._imports = {};
		var index = 0;
		this._import_section.forEach((imp, i) => {
			if (imp.type.type !== 'func_type') return ;
			this._imports[imp.field] = index++;
		});
		this._function_base = index;

		const targets = names(Instructions).concat("execute_call", "finalize_call", "adjust_clock");

		this._templates = {};
		defs.export_section.forEach((exp) => {
			if (exp.index < imported_functions || exp.kind !== 'func_type') return ;
			if (targets.indexOf(exp.field) < 0) return ;

			const func = defs.function_section[exp.index - imported_functions];

			this._templates[exp.field] = this.template(func, exp.field);
		});
	}

	template (func, name) {
		const parameters = func.type.parameters.map((p, i) => ({ index: i }));
		const modified = [];

		// Process backwards
		const code = func.code;
		var i = code.length - 2;	// Trim tail "end"
		var depth = 0;

		while (i >= 0) {
			const term = code[i];
			const op = (typeof term === 'string') ? term : term.op;

			switch (op) {
			case "call":
				if (term.function_index !== this._imports.execute) break ;

				{
					let stack = -2;

					while (stack != 0) {
						const term = code[--i];
						const op = (typeof term === 'string') ? term : term.op;

						switch(op) {
						case 'get_local':
							stack++;
							break ;
						case 'i32.add':
							stack--;
							break ;
						case 'i32.const':
							stack++;
							break ;
						default:
							throw new Error(`Cannot unroll stack for op ${op}`);
						}
					}
				}

				modified.unshift( { template: 'delay' } );
				continue ;

			case "get_local":
				if (term.index < parameters.length) {
					modified.unshift(parameters[term.index]);
					i--;
					continue ;
				}

				break ;

			case "tee_local":
			case "set_local":
				if (term.index < parameters.length) {
					parameters[term.index].dynamic = true;
				}
				break ;

			case "end":
				depth++;
				break ;
			case "if":
			case "loop":
			case "block":
				depth--;
				break ;

			}

			modified.unshift(term);
			i--;
		}

		parameters.forEach((param, i) => {
			if (param.dynamic) {
				modified.unshift({ op: 'set_local', index: i });
				modified.unshift({ template: "argument", index: i });
				param.op = 'get_local';
			} else {
				param.template = 'argument';
			}
		});

		return {
			locals: func.type
				.parameters.map((v) => ({ type: v, count: 1 }))
				.concat(func.locals),
			code: modified
		};
	}

	process(template, values, naked = false) {
		const body = template.code.reduce((acc, k) => {
			if (k.template === undefined) {
				acc.push(k);
				return acc;
			}

			switch (k.template) {
			case 'delay':
				let pc = values[0];
				let delayed = values[2];

				if (delayed) {
					acc.push("unreachable");
				}

				// Template the adjust clock code
				acc.push.apply(acc, this.process(this._templates.adjust_clock, [(pc + 8) >> 0], true));

				// call the delayed branch slot
				acc.push(
					{ op: 'call', function_index: this.instruction(pc + 4, true) },
					"return"
				);

				return acc;

			case 'argument':
				acc.push({ op: 'i32.const', value: values[k.index] >> 0 });
				return acc ;

			default:
				throw k;
			}
		}, []);

		if (naked) return body;

		body.push("end");

		return {
			type: { type: "func_type", parameters: [], returns: [] },
			locals: template.locals,
			code: body
		};
	}

	instruction(pc, delayed, tailcall = null) {
		const op = this.locate(pc);

		if (op === null) {
			this.functions.push({
				type: { type: "func_type", parameters: [], returns: [] },
				locals: [],
				code: [
					{ op: 'i32.const', value: pc >> 0 },
					{ op: 'i32.const', value: delayed ? 1 : 0 },
			        { op: "call", function_index: this._imports.execute }
				]
			});

			return this._function_base + this.functions.length - 1;
		}

		const template = this._templates[op.name];
		const body = this.process(template, [pc, op.word, delayed], true);

		if (tailcall !== null) {
			body.push({ op: 'call', function_index: tailcall });
		}

		body.push("end");

		this.functions.push({
			type: { type: "func_type", parameters: [], returns: [] },
			locals: template.locals,
			code: body
		});

		return this._function_base + this.functions.length - 1;
	}

	compile(start, length, locate) {
		const end = start + length * 4;
		const table = [];

		this.locate = locate;
		this.functions = [
			this.process(this._templates.execute_call, [start, length]),
			this.process(this._templates.finalize_call, [end])
		];

		// Prime function table with the "Tail"
		var previous = this._function_base + 1;
		for (var i = length - 1; i >= 0; i--) {
			table[i] =
			previous = this.instruction(start+i*4, 0, previous);
		}

		const module = {
			magicNumber: 0x6d736100,
			version: 1,

			import_section: this._import_section,
			function_section: this.functions,

			type_section: [{ type: "func_type", parameters: [], returns: [] }],

			export_section: [{
    			"field": "block",
    			"kind": "func_type",
    			"index": this._function_base
			}],

			element_section: [{
				type: "element_segment",
				index: 0,
				offset: [
					{ op: "i32.const", value: 0 },
					"end"
				],
				elements: table
			}],

			table_section: [{
				type: "table_type",
				element_type: "anyfunc",
				limits: {
					type: "resizable_limits",
					initial: table.length,
					maximum: table.length
				}
			}]
		};

		return Export(module);
	}
}

export function locate(word) {
	const fields = new Fields(word);
	var entry = Instructions;
	var fallback = null;

	while (typeof entry === "object") {
		fallback = entry.fallback || fallback;
		entry = entry[fields[entry.field]];
	}

	fields.name = entry || fallback;

	return fields;
}

export function disassemble(word, address) {
	const op = locate(word);
	return Disassembly[op.name](op, address);
}
