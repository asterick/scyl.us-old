import Export from "../../../dynast/export";
import Import from "../../../dynast/import";

export function process(ab) {
	const defs = Import(ab);

	return
}

export function compile(template, start, length, locate) {
}

/*
export function block(body) {
	return { type: "null_block", body: body }
}

export function local(index) {
	return [{ op: 'get_local', index }];
}

function indexValue(index) {
	if (index.length > 1 || index[0].type != i32.const) {
		return null;
	}

	return index[0].value;
}

export function value(target) {
	if (typeof target === "number") {
		return [{ op: "i32.const", value: target }];
	} else {
		return target;
	}
}

export function read(target) {
	if (typeof target === "object") {
		return [
			{ op: "i32.const", value: 0 },

			... target,
			{ op: "i32.const", value: 4 },
			'i32.mul',
			{ op: "i32.load", "flags": 2, "offset": 0 },

			... target,
			"i32.eqz",

			"select"
		];
	} else if (target > 0) {
		return [
			{ op: 'i32.const', value: target * 4 },
			{ op: "i32.load", "flags": 2, "offset": 0 }
		];
	} else {
		return [
			{ op: 'i32.const', value: 0 }
		];
	}
}

export function write(target, value) {
	if (typeof target === "object") {
		return [
			... target,
			{ op: "i32.const", value: 4 },
			"i32.mul",

			{ op: "i32.const", value: 0 },
			... value,
			... target,
			"i32.eqz",

			"select",

			{ op: "i32.store", "flags": 2, "offset": 0 },
		];
	} else if (target > 0) {
		return [
			{ op: 'i32.const', value: target * 4 },
			... value,
			{ op: "i32.store", "flags": 2, "offset": 0 }
		]
	} else {
		return [
			... value,
			"drop"
		];
	}
}

export function exception(code, pc, delayed, cop = [{ op: 'i32.const', value: 0 }] ) {
	return [
		{ op: 'i32.const', value: code },
        ... pc,
        ... delayed,
        ... cop,
        { op: "call", function_index: CALLS.EXCEPTION },
        "unreachable"
	]
}

export function module(functions) {
	const result = {
	    "magicNumber": 1836278016,
	    "version": 1,
	    "export_section": [],
	    "function_section": [],
	    "import_section": [
			{
	            "module": "processor",
	            "field": "memory",
	            "type": {
	                "type": "memory_type",
	                "limits": {
	                    "type": "resizable_limits",
	                    "initial": 1,
	                    "maximum": null
	                }
	            }
	        },
        	{
	            "module": "processor",
	            "field": "delay_execute",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "exception",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32", "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "load",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32", "i32" ],
	                "returns": [ "i32" ]
	            }
	        },
	        {
	            "module": "processor",
	            "field": "store",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32", "i32", "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "mfc0",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32", "i32" ],
	                "returns": [ "i32" ]
	            }
	        },
	        {
	            "module": "processor",
	            "field": "mtc0",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32", "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "rfe",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "tlbr",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "tlbwi",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "tlbwr",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	            "module": "processor",
	            "field": "tlbp",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32", "i32" ],
	                "returns": []
	            }
	        },
	        {
	        	"module": "processor",
	        	"field": "debug",
	            "type": {
	                "type": "func_type",
	                "parameters": [ "i32" ],
	                "returns": []
	            }
	        }
	    ]
	}

	Object.keys(functions).forEach((name, i) => {
		result.function_section.push({
            "type": {
                "type": "func_type",
                "parameters": ['i32', 'i32', 'i32'],
                "returns": []
            },
            "locals": [
            	{ count: 2, type: 'i32' },
            	{ count: 1, type: 'i64' }
            ],
            "code": functions[name]
        });
		result.export_section.push({
            "field": name,
            "kind": "func_type",
            "index": i + CALLS.EXPORT_BASE_INDEX
		});
	});

	return Export(result);
}

export function dynamicCall(func) {
	return [
		{ op: 'block', block:
			block(func(
				FieldsWasmDynamic,
				local(LOCAL_VARS.INSTRUCTION_PC),
				local(LOCAL_VARS.INSTRUCTION_DELAYED),
				() => [
					... local(LOCAL_VARS.INSTRUCTION_PC),
					{ op: 'i32.const', value: 4 },
					"i32.add",
			        { op: 'i32.const', value: 1 },
			        { op: "call", function_index: CALLS.EXECUTE },
			        { op: 'br', relative_depth: 0 }
				]
			))
		},

		// Increment our clock once every time we step
		... write(REGS.CLOCKS, [
			... read(REGS.CLOCKS),
			... value(1),
			"i32.sub",
		])
	];
}

export function staticBlock(start, length, locate) {
	const end = start + length * 4;
	const escapeTable = [];

	var code = { op: 'block', block: block([
		// Calculate current PC table offset
		... read(REGS.PC),
		{ op: 'i32.const', value: (start) >> 0 },
		"i32.sub",
		{ op: 'i32.const', value: 2 },
		"i32.shr_u",

		{ op: 'br_table', target_table: escapeTable, default_target: length }
	])};

	function func(pc, delayed, escape_depth) {
		var op = locate(pc);
		var call;

		if (op === null) {
			return [
				{ op: 'i32.const', value: pc >> 0 },
				... value(delayed ? 1 : 0),
		        { op: "call", function_index: CALLS.EXECUTE },
			];
		}

		return op.instruction(op, value(pc >> 0), value(delayed), () => delayed ? ["unreachable"] : [
			... func(pc + 4, 1, escape_depth),

			... write(REGS.CLOCKS, [
				... read(REGS.CLOCKS),
				{ op: 'i32.const', value: (pc + 8) >> 0 },
				... local(LOCAL_VARS.START_PC),
				"i32.sub",
				{ op: 'i32.const', value: 4 },
				"i32.div_u",
				"i32.sub"
			]),

			{ op: 'br', relative_depth: escape_depth }
		]);
	}

	for (var i = 0; i < length; i++) {
		escapeTable.push(i);

		code = { op: 'block', block: block([
			code,
			... func(start + i * 4, 0, length - i)
		])}
	}

	// Fall through trap (continue to next execution cell)
	code.block.body.concat([
		// Update PC
		... write(REGS.PC, [
			{ op: 'i32.const', value: end >> 0 }
		]),

		// Eat some cycles (based on PC)
		... write(REGS.CLOCKS, [
			... read(REGS.CLOCKS),
			{ op: 'i32.const', value: end >> 0 },
			... local(LOCAL_VARS.START_PC),
			"i32.sub",
			{ op: 'i32.const', value: 2 },
			"i32.shr_u",
			"i32.sub"
		])
	]);

	return [
		{ op: 'block', block: block([
			{ op: 'loop', block: block([
				// Log our beginning PC
				... read(REGS.PC),
				{ op: 'set_local', index: LOCAL_VARS.START_PC },

				// Break when our clock runs out
				... read(REGS.CLOCKS),
				{ op: 'i32.const', value: 0 },
				"i32.le_s",
				{ op: 'br_if', relative_depth: 1 },

				// Default section
				{ op: 'block', block: block([
					code,

					// Escape from execution block
					"return"
				])},

				{ op: 'br', relative_depth: 0 }
			])},
		])}
	];
}
*/