import { Fields } from "./fields";
import { instructions } from "./table";
import { load, exports } from ".";

import Export from "../../dynast/export";
import Import from "../../dynast/import";

// WARNING: This can possibly cause call stack to overflow, depending on how
// large an instruction chain is, may have to use trampolines later

var _import_section;
var _imports;
var _function_base;
var _function_names;
var _templates;

export function disassemble(word, address) {
	const op_index = exports.locate(word);

	if (op_index < 0) throw new Error(`Could not decode instruction ${word.toString(16)}`);

	return instructions[_function_names[op_index]](new Fields(word), address);
}

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

	// Count imported functions
	const imported_functions =
		defs.import_section.filter((v) => v.type.type === 'func_type').length;

	// Build (and sort) indexed table of exported functions
	const exported_functions = defs.export_section
		.sort((a, b) => a.index - b.index)
		.filter(v => v.kind === 'func_type')
		.reduce((acc, v) => { 
			acc[v.index] = v.field;
			_function_base = v.index + 1;
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

	_function_names = [];
	defs.table_section.forEach((v, index) => {
		if (v.element_type !== 'anyfunc') return ;

		defs.element_section.forEach((el) => {
			if (el.index !== index) return ;
			var offset = evaluate(el.offset);
			el.elements.forEach((el, i) => _function_names[i+offset] = exported_functions[el])
		});	
	});

	_imports = {};
	var index = 0;
	_import_section.forEach((imp, i) => {
		if (imp.type.type !== 'func_type') return ;
		_imports[imp.field] = index++;
	});

	// Templatize things we will use
	const template_names = ["block_execute", "branch"].concat(Object.keys(instructions));
	_templates = {};
	defs.export_section.forEach((exp) => {
		if (template_names.indexOf(exp.field) < 0) return ;

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
	var i = code.length - 1;
	var depth = 0;

	while (i >= 0) {
		const term = code[i];
		const op = (typeof term === 'string') ? term : term.op;

		switch (op) {
		case "return":
			modified.unshift( { template: 'tailcall' } );
			break ;

		case "call":
			// Implicit return after a branch
			if (term.function_index === _imports.branch) {
				modified.unshift(term);
				modified.unshift("return");
				i--;
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
	const tailcall = values[2];

	const body = template.code.map((k) => {
		if (k.template === undefined) {
			return k;
		}

		switch (k.template) {
		case 'tailcall':
			if (tailcall) {
				return { op: 'call', function_index: tailcall };
			} else {
				return "nop";
			}

		case 'argument':
			return { op: 'i32.const', value: values[k.index] >> 0 };

		default:
			throw k;
		}
	});

	if (tailcall) {
		funct.code.push({ op: 'call', function_index: tailcall });
	}

	return {
		type: { type: "func_type", parameters: [], returns: [] },
		locals: template.locals,
		code: body
	};
}

export function compile(start, length) {
	const table = [];
	const block_end = start + length * 4;

	let functions = [
		process(_templates.block_execute, start, block_end), // Execute body
		process(_templates.branch, block_end - 4, block_end) // Finalize call
	];

	// Prime function table with the "Tail"
	for (var i = 0; i < length; i++) {
		const pc = start + i*4;
		const word = load(pc);
		const template = _templates[_function_names[exports.locate(word)]];
		const funct = process(template, pc, word, _function_base + i + 1);

		functions.push(funct);

		table[i] = _function_base + i;
	}

	const module = {
		magicNumber: 0x6d736100,
		version: 1,

		import_section: _import_section,
		function_section: functions,

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
