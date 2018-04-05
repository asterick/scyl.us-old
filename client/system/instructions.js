import { Fields } from "./fields";
import { instructions } from "./table";
import { load, exports } from ".";

import Export from "../../dynast/export";
import Import from "../../dynast/import";

// WARNING: This can possibly cause call stack to overflow, depending on how
// large an instruction chain is, may have to use trampolines later

var _import_section;
var _imports;
var _functions;
var _function_base;
export var function_names;
var _templates;

var _block_start;
var _block_end;

const boilerplate = ["execute_call", "calculate_clock", "finalize_call"].concat(Object.keys(instructions));

function evaluate(code) {
	var stack = [];

	code.forEach(op => {
		if (op === 'end') return ;

		switch (op.op) {
		case 'i32.const':
			stack.push(op.value);
			break;
		default:
			throw new Error("Cannot evaluate");
		}
	});

	return stack.pop();
}

export function initialize(ab) {
	const defs = Import(ab);

	// Validate
	const imported_functions =
		defs.import_section.filter((v) => v.type.type === 'func_type').length;

	const exported_functions = defs.export_section
		.filter(v => v.kind === 'func_type')
		.reduce((acc, v) => { 
			acc[v.index] = v.field;
			return acc;
		}, [])
		;

	_import_section = defs.import_section.concat(
		defs.export_section.map((i) => {
			switch (i.kind) {
			case 'memory_type':
				return {
        			"module": "core",
        			"field": i.field,
        			"type": defs.memory_section[i.index]
        		};
            case 'global_type':
				return {
        			"module": "core",
        			"field": i.field,
        			"type": defs.global_section[i.index].type
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

	function_names = [];
	defs.table_section.forEach((v, index) => {
		if (v.element_type !== 'anyfunc') return ;

		defs.element_section.forEach((el) => {
			if (el.index !== index) return ;
			var offset = evaluate(el.offset);
			el.elements.forEach((el, i) => function_names[i+offset] = exported_functions[el])
		});	
	});

	_imports = {};
	var index = 0;
	_import_section.forEach((imp, i) => {
		if (imp.type.type !== 'func_type') return ;
		_imports[imp.field] = index++;
	});
	_function_base = index;

	_templates = {};
	defs.export_section.forEach((exp) => {
		if (boilerplate.indexOf(exp.field) < 0) return ;

		if (exp.index < imported_functions || exp.kind !== 'func_type') return ;

		const func = defs.function_section[exp.index - imported_functions];

		_templates[exp.field] = template(func, exp.field);
	});
}

function template(func, name) {
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
		case "return":
			modified.unshift( { template: 'tailcall' } );
			i--;
			continue ;

		case "call":
			if (term.function_index === _imports.execute) {
				let stack = -2;

				while (stack != 0) {
					const term = code[--i];
					const op = (typeof term === 'string') ? term : term.op;

					switch(op) {
					case 'get_local':
					case 'i32.load':
					case 'i32.const':
						stack++;
						break ;
					case 'i32.add':
						stack--;
						break ;
					default:
						throw new Error(`Cannot unroll stack for op ${op}`);
					}
				}

				modified.unshift( { template: 'delay' } );
				continue ;
			}
			break ;

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

function process(template, ... values) {
	return template.code.reduce((acc, k) => {
		if (k.template === undefined) {
			acc.push(k);
			return acc;
		}

		switch (k.template) {
		case 'tailcall':
			let tailcall = values[3];

			if (tailcall) acc.push({ op: 'call', function_index: tailcall });
			acc.push("return");

			return acc;

		case 'delay':
			let pc = values[0];
			let delayed = values[2];

			if (delayed) {
				acc.push("unreachable");
			}

			// Template the adjust clock code
			acc.push.apply(acc, process(_templates.calculate_clock, (pc + 8) >>> 0));

			// call the delayed branch slot
			acc.push(
				{ op: 'call', function_index: instruction(pc + 4, true) },
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
}

function fallback(pc, delayed) {
	const body = delayed ? [] : process(_templates.finalize_call, pc + 4)

	return {
		type: { type: "func_type", parameters: [], returns: [] },
		locals: _templates.finalize_call.locals,
		code: body.concat(
			{ op: 'i32.const', value: pc >> 0 },
			{ op: 'i32.const', value: delayed ? 1 : 0 },
	        { op: "call", function_index: _imports.execute },
	        "end"
		)
	};
}

function instruction(pc, delayed, tailcall = null) {
	var funct;

	// Do not assemble past block end (fallback to intepret)
	if (pc < _block_end && pc >= _block_start) {
		try {
			const op = locate(load(pc));
			const template = _templates[op.name];
			const body = process(template, pc, op.word, delayed, tailcall);

			// This is the start of a test harness to make sure my templating works (it doesn't)
			if ([].indexOf(op.name) < 0)
			{
				//console.log(op.name)
				throw null;
			}

			funct = {
				type: { type: "func_type", parameters: [], returns: [] },
				locals: template.locals,
				code: body
			};

			if (tailcall !== null) {
				funct.code.push({ op: 'call', function_index: tailcall });
			}
			
			funct.code.push("end");
		} catch (e) {
			// fall back to interpreted
			funct = fallback(pc, delayed);
		}
	} else {
		funct = fallback(pc, delayed);
	}

	return _function_base + _functions.push(funct) - 1;
}

export function compile(start, length) {
	const table = [];

	_block_start = start;
	_block_end = start + length * 4;

	_functions = [
		// Execute body
		{
			type: { type: "func_type", parameters: [], returns: [] },
			locals: _templates.execute_call.locals,
			code: process(_templates.execute_call, start, length).concat("end")
		},
		// Finalize call
		{
			type: { type: "func_type", parameters: [], returns: [] },
			locals: _templates.execute_call.locals,
			code: process(_templates.finalize_call, _block_end).concat("end")
		},
	];

	// Prime function table with the "Tail"
	var previous = _function_base + 1;
	for (var i = length - 1; i >= 0; i--) {
		table[i] =
		previous = instruction(start+i*4, 0, previous);
	}

	const module = {
		magicNumber: 0x6d736100,
		version: 1,

		import_section: _import_section,
		function_section: _functions,

		export_section: [{
			"field": "block",
			"kind": "func_type",
			"index": _function_base
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

	_functions = null;

	return Export(module);
}

export function locate(word) {
	const instruction = exports.locate(word);

	if (instruction <= 0) throw new Error(`Could not decode instruction ${word.toString(16)}`);

	const fields = new Fields(word);
	fields.name = function_names[instruction];

	return fields;
}
