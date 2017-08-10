import Export from "../../../dynast/export";
import Import from "../../../dynast/import";

import Instructions from "./base";

// WARNING: This can possibly cause call stack to overflow, depending on how
// large a function is, may have to use trampolines later

function names(table) {
	return Object.keys(table).reduce((acc, key) => {
		const entry = table[key];
		if (typeof entry === 'string') {
			return acc.concat(entry);
		} else {
			return acc.concat(names(entry))
		}
	}, [])
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
	            	throw new Error(`Cannot import ${i.kind}`)
	            }
			}),
			{
				"module": "env",
				"field": "debug",
				"type": {
					"type": "func_type",
					"parameters": ["i32"],
					"returns": []
				}
			}
		);

		this._imports = {};
		var index = 0;
		this._import_section.forEach((imp, i) => {
			if (imp.type.type !== 'func_type') return ;
			this._imports[imp.field] = index++;
		})
		this._function_base = index;

		const targets = names(Instructions);

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
					modified.unshift( parameters[term.index] );
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

	instruction(functions, locate, pc, delayed, tailcall = null) {
		var op = locate(pc);

		if (op === null) {
			return [
				{ op: 'i32.const', value: pc >> 0 },
				{ op: 'i32.const', value: delayed ? 1 : 0 },
		        { op: "call", function_index: this._imports.execute }
			]
		}

		const template = this._templates[op.name];
		const values = [pc, op.word, delayed];

		const body = template.code.reduce((acc, k) => {
			if (k.template === undefined) {
				acc.push(k);
				return acc;
			}

			switch (k.template) {
			case 'delay':
				if (delayed) {
					acc.push("unreachable");
				}

				acc.push(
					{ op: 'call', function_index: this.instruction(functions, locate, pc + 4, true) },

					{ op: 'call', function_index: this._imports.getClocks },
					{ op: 'i32.const', value: (pc + 8) >> 0 },
					{ op: 'call', function_index: this._imports.getStartPC },
					"i32.sub",
					{ op: 'i32.const', value: 4 },
					"i32.div_u",
					"i32.sub",
					{ op: 'call', function_index: this._imports.setClocks },
					"return"
				);
				return acc;

			case 'argument':
				acc.push({ op: 'i32.const', value: values[k.index] >> 0 });
				return acc ;

			default:
				throw k
			}
		}, []);

		if (tailcall !== null) {
			body.push({ op: 'call', function_index: tailcall });
		}

		body.push("end");

		const index = this._function_base + functions.length;

		functions.push({
			type: { type: "func_type", parameters: [], returns: [] },
			locals: template.locals,
			code: body
		});

		return index;
	}


	wrap(code) {
		return
	}

	compile(start, length, locate) {
		length = 1024;

		const end = start + length * 4;
		const table = [];
		const functions = [
			{
				type: { type: "func_type", parameters: [], returns: [] },
				locals: [{ count: 1, type: 'i32' }],
				code: [
					{ op: 'block', kind: 'void' },
						{ op: 'loop', kind: 'void' },
							// Break when our clock runs out
							{ op: 'call', function_index: this._imports.getClocks },
							{ op: 'i32.const', value: 0 },
							"i32.le_s",
							{ op: 'br_if', relative_depth: 1 },

							// Calculate current PC table offset
							{ op: 'call', function_index: this._imports.getPC },
							{ op: 'tee_local', index: 0 },
							{ op: 'call', function_index: this._imports.setStartPC },

							{ op: 'get_local', index: 0 },
							{ op: 'i32.const', value: start >> 0 },
							"i32.sub",
							{ op: 'i32.const', value: 2 },
							"i32.shr_u",

							{ op: 'tee_local', index: 0 },
							{ op: 'i32.const', value: length >> 0 },
							{ op: 'i32.gt_u' },
							{ op: 'br_if', relative_depth: 1 },

							{ op: 'get_local', index: 0 },
							{ op: "call_indirect", type_index: 0, reserved: 0 },

							// Default section
							{ op: 'br', relative_depth: 0 }, // Continue
						"end",
					"end",
				    "end"	// End of function
				]
			},
			{
				type: { type: "func_type", parameters: [], returns: [] },
				locals: [],
				code: [
					// Update PC
					{ op: 'i32.const', value: end >> 0 },
					{ op: 'call', function_index: this._imports.setPC },

					// Eat some cycles (based on PC)
					{ op: 'call', function_index: this._imports.getClocks },
					{ op: 'i32.const', value: end >> 0 },
					{ op: 'call', function_index: this._imports.getStartPC },
					"i32.sub",
					{ op: 'i32.const', value: 2 },
					"i32.shr_u",
					"i32.sub",
					{ op: 'call', function_index: this._imports.setClocks },
					"end"
				]
			}

		];

		// Prime function table with the "Tail"
		var previous = this._function_base + 1;
		for (var i = length - 1; i >= 0; i--) {
			table[i] =
			previous = this.instruction(functions, locate, start+i*4, 0, previous);
		}

		const module = {
			magicNumber: 0x6d736100,
			version: 1,

			import_section: this._import_section,
			function_section: functions,

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
		}

		return Export(module);
	}
}
