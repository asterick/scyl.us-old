import Export from "../../../dynast/export";
import { FieldsWasmDynamic } from "./fields";

export const REGS = {
	LR: 31,
	LO: 32,
	HI: 33,
	PC: 34,
	CLOCKS: 35
};

export const CALLS = {
	EXECUTE: 0,
	EXCEPTION: 1,
	LOAD: 2,
	STORE: 3,
	MFC0: 4,
	MTC0: 5,
	RFE: 6,
	TLBR: 7,
	TLBWI: 8,
	TLBWR: 9,
	TLBP: 10,

	EXPORT_BASE_INDEX: 11
};

export const LOCAL_VARS = {
	INSTRUCTION_WORD: 0,
	INSTRUCTION_PC: 1,
	INSTRUCTION_DELAYED: 2,
	I32_TEMP: 3,
	I64_TEMP: 4
};

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
			{ op: 'i32.mul' },
			{ op: "i32.load", "flags": 2, "offset": 0 },

			... target,
			{ op: 'i32.eqz' },

			{ op: "select" }
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
			{ op: 'i32.mul' },

			{ op: "i32.const", value: 0 },
			... value,
			... target,
			{ op: 'i32.eqz' },

			{ op: 'select' },

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
			{ op: "drop" }
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
        { op: "unreachable" }
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
	                "parameters": [ "i32" ],
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
	        }
	    ]
	}

	Object.keys(functions).forEach((name, i) => {
		result.function_section.push({
            "locals": [
            	{ count: 1, type: 'i32' },
            	{ count: 1, type: 'i64' }
            ],
            "type": {
                "type": "func_type",
                "parameters": ['i32', 'i32', 'i32'],
                "returns": []
            },
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
					{ op: 'i32.add' },
			        { op: "call", function_index: CALLS.EXECUTE },
			        { op: 'br', relative_depth: 0 }
				]
			))
		},

		// Increment our clock once every time we step
		... write(REGS.CLOCKS, [
			... read(REGS.CLOCKS),
			... value(1),
			{ op: 'i32.sub' },
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
		{ op: 'i32.sub' },
		{ op: 'i32.const', value: 4 },
		{ op: 'i32.div_u' },

		{ op: 'br_table', target_table: escapeTable, default_target: length }
	])};

	function func(pc, delayed, escape_depth) {
		var op = locate(pc);

		return op.instruction(op, value(pc >> 0), value(delayed), () => delayed ? [{ op: 'unreachable' }] : [
			... func(pc + 4, 1, escape_depth),

			... write(REGS.CLOCKS, [
				... read(REGS.CLOCKS),
				{ op: 'i32.const', value: (pc + 8) >> 0 },
				... read(REGS.PC),
				{ op: 'i32.sub' },
				{ op: 'i32.const', value: 4 },
				{ op: 'i32.div_u' },
				{ op: 'i32.sub' }
			]),

			{ op: 'br', relative_depth: escape_depth }
		]);
	}

	for (var i = 0; i < length; i++) {
		const pc = start + length * 4;
		escapeTable.push(i);

		code = { op: 'block', block: block([
			code,
			... func(pc, 0, length - i)
		])}
	}

	return [
		{ op: 'loop', block: block([
			// Break when our clock runs out
			... read(REGS.CLOCKS),
			{ op: 'i32.const', value: 0 },
			{ op: 'i32.le_s' },
			{ op: 'br_if', relative_depth: 0 },

			// Switch table begin
			{ op: 'block', block: block([
				code,

				// Eat some cycles (based on PC)
				... write(REGS.CLOCKS, [
					... read(REGS.CLOCKS),
					{ op: 'i32.const', value: end >> 0 },
					... read(REGS.PC),
					{ op: 'i32.sub' },
					{ op: 'i32.const', value: 4 },
					{ op: 'i32.div_u' },
					{ op: 'i32.sub' }
				]),

				// Update PC
				... write(REGS.PC, [
					{ op: 'i32.const', value: end >> 0 }
				]),

				// Return from result
				{ op: 'return' }
			])}
		])}
	]
}
