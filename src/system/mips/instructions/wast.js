import Export from "../../../dynast/export";
import Import from "../../../dynast/import";

import Instructions from "./base";

// TODO: One WebAssembly supports tail calls, convert to function table
// instead of a br_table

class Registers {
	constructor() {
		this._index = { i32: 0, i64: 0, f32: 0, f64: 0 };
		this._max = { i32: 0, i64: 0, f32: 0, f64: 0 };
		this._list = [];

		this._stack = [];
	}

	push() {
		this._stack.push(this._index);
		this._index = Object.create(this._index);
	}

	pop() {
		this._index = this._stack.pop();
	}

	get(type) {
		const obj = {
			type: type,
			index: this._index[type]++,
			tee: { op: 'tee_local' },
			get: { op: 'get_local' },
			set: { op: 'set_local' }
		};

		this._max[type] = Math.max(this._max[type], this._index[type]);
		this._list.push(obj);

		return obj;
	}

	bake() {
		var base = 0;
		var result = [];
		var offset = {};

		Object.keys(this._max).forEach((type) => {
			const max = this._max[type]

			result.push({ count: max, type });

			offset[type] = base;
			base += max;
		});

		this._list.forEach((k) => {
			k.set.index = k.get.index = k.tee.index = offset[k.type] + k.index;
		})

		return result;
	}
}

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

		this._base = {
			magicNumber: 0x6d736100,
			version: 1,

			export_section: [
				{
            		"field": "block",
            		"kind": "func_type",
            		"index": exported_functions + imported_functions + 1
				}
			],
			import_section: defs.import_section.concat(
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
				})
			)
		}


		this._base.import_section.push({
			"module": "env",
			"field": "debug",
			"type": {
				"type": "func_type",
				"parameters": ["i32"],
				"returns": []
			}
		});

		this._imports = {};
		var index = 0;
		this._base.import_section.forEach((imp, i) => {
			if (imp.type.type !== 'func_type') return ;
			this._imports[imp.field] = index++;
		})

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
		const locals = func.type.parameters.concat();
		const parameters = func.type.parameters.map((p, i) => ({ index: i }));
		const modified = [];

		// Unroll locals
		func.locals.forEach((group) => {
			for (var i = 0; i < group.count; i++) locals.push(group.type);
		});

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

				modified.unshift( { template: 'delay', relative_depth: depth } );
				continue ;

			case "return":
				modified.unshift( { template: 'eject', relative_depth: depth } )
				i--;
				continue ;

			case "get_local":
				if (term.index < parameters.length) {
					modified.unshift( parameters[term.index] );
				} else {
					modified.unshift({ template: "get_local", index: term.index });
				}

				i--;
				continue ;

			case "tee_local":
			case "set_local":
				if (term.index < parameters.length) {
					parameters[term.index].dynamic = true;
				}

				modified.unshift({ template: op, index: term.index });
				i--;
				continue ;

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
				modified.unshift({ template: 'set_local', index: i });
				modified.unshift({ template: "argument", index: i });
				param.template = 'get_local';
			} else {
				param.template = 'argument';
			}
		});

		return { locals, code: modified };
	}

	compile(start, length, locate) {
		const allocator = new Registers;
		const end = start + length * 4;

		const func = (pc, delayed, escape_depth) => {
			var op = locate(pc);

			if (op === null) {
				code.push(
					{ op: 'i32.const', value: pc >> 0 },
					{ op: 'i32.const', value: delayed ? 1 : 0 },
			        { op: "call", function_index: this._imports.execute }
				);
				return ;
			}

			const template = this._templates[op.name];

			const execute = delayed ?
				() => code.push("unreachable") :
				(depth) => {
					func(pc + 4, 1, escape_depth + depth);
					code.push(
						{ op: 'call', function_index: this._imports.getClocks },
						{ op: 'i32.const', value: (pc + 8) >> 0 },
						START_PC.get,
						"i32.sub",
						{ op: 'i32.const', value: 4 },
						"i32.div_u",
						"i32.sub",
						{ op: 'call', function_index: this._imports.setClocks },

						{ op: 'br', relative_depth: escape_depth }
					);
				}

			allocator.push();

			var parameters = template.locals.map((type) => allocator.get(type));
			const values = [pc, op.word, delayed];

			template.code.forEach((k) => {
				if (k.template === undefined) {
					code.push(k);
					return ;
				}

				switch (k.template) {
				case 'delay':
					execute(k.relative_depth);
					break ;
				case 'eject':
					code.push({ op: 'br', relative_depth: k.relative_depth });
					break ;
				case 'argument':
					code.push({ op: 'i32.const', value: values[k.index] >> 0 });
					break ;
				case 'get_local':
					code.push(parameters[k.index].get);
					break ;
				case 'set_local':
					code.push(parameters[k.index].set);
					break ;
				case 'tee_local':
					code.push(parameters[k.index].tee);
					break ;
				default:
					throw k
				}

				return ;
			});

			allocator.pop();
		}

		const START_PC = allocator.get('i32');
		const escapeTable = [];

		// Header
		const code = [
			{ op: 'block', kind: 'void' },
				{ op: 'loop', kind: 'void' },
					// Break when our clock runs out
					{ op: 'call', function_index: this._imports.getClocks },
					{ op: 'i32.const', value: 0 },
					"i32.le_s",
					{ op: 'br_if', relative_depth: 1 },

					// Log our beginning PC
					{ op: 'call', function_index: this._imports.getPC },
					START_PC.set,

					// Default section
					{ op: 'block', kind: 'void' }
		];

		// Leader block
		for (var i = 0; i < length; i++) {
			escapeTable.push(i);
			code.push({ op: 'block', kind: 'void' });
		}

		// Address Selector
		code.push(
			{ op: 'block', kind: 'void' },

			{ op: 'call', function_index: this._imports.getPC },
			{ op: 'i32.const', value: start >> 0 },
			"i32.sub",
			{ op: 'i32.const', value: 2 },
			"i32.shr_u",
			{ op: 'call', function_index: this._imports.debug },

			// Calculate current PC table offset
			{ op: 'call', function_index: this._imports.getPC },
			{ op: 'i32.const', value: start >> 0 },
			"i32.sub",
			{ op: 'i32.const', value: 2 },
			"i32.shr_u",

			{ op: 'br_table', target_table: escapeTable, default_target: length }
		);

		// Inline body
		for (var i = 0; i < length; i++) {
			code.push("end");

			func(start + i * 4, 0, length - i);
		}

		// Fall through trap (continue to next execution cell)
		code.push(
			{ op: 'i32.const', value: 1 },
			{ op: 'call', function_index: this._imports.debug },

			// Update PC
			{ op: 'i32.const', value: end >> 0 },
			{ op: 'call', function_index: this._imports.setPC },

			// Eat some cycles (based on PC)
			{ op: 'call', function_index: this._imports.getClocks },
			{ op: 'i32.const', value: end >> 0 },
			START_PC.get,
			"i32.sub",
			{ op: 'i32.const', value: 2 },
			"i32.shr_u",
			"i32.sub",
			{ op: 'call', function_index: this._imports.setClocks },

			{ op: 'i32.const', value: 0x888 },
			{ op: 'call', function_index: this._imports.debug },

			"end",

			// Default Case
			{ op: 'i32.const', value: 0x999 },
			{ op: 'call', function_index: this._imports.debug },

			// Escape from execution block
			"return",
			"end",

			{ op: 'br', relative_depth: 0 },	// Continue
			"end",
			"end",
		    "end"	// End of function
		);

		this._base.function_section = [{
			type: { type: "func_type", parameters: [], returns: [] },
			locals: allocator.bake(),
			code: code
		}];

		return Export(this._base);
	}
}
