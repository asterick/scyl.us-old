import Export from "../../../dynast/export";

export const REGS = {
	LO: 32,
	HI: 33,
	PC: 34
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
};

export const LOCAL_VARS = {
	I64_TEMP: 0,
	I32_TEMP: 1,
	INSTRUCTION_WORD: 2,
	INSTRUCTION_PC: 3,
	INSTRUCTION_DELAYED: 4
};

export function read(index) {
	if (Array.isArray(index)) {
		return [
			... index,
			{ op: "i32.const", value: 4 },
			{ op: 'i32.mul' },
			{ op: "i32.load", "flags": 2, "offset": 0 },
			{ op: "i32.const", value: 0 },
			... index,
			{ op: "select" }
		];
	}

	return index ? [
		{ op: 'i32.const', value: index * 4 },
		{ op: "i32.load", "flags": 2, "offset": 0 }
	] : [
		{ op: 'i32.const', value: 0 }
	];
}

export function write(index, value) {
	if (Array.isArray(index)) {
		return [
			... value,
			... index,
			{ op: 'i32.eqz' },
			{ op: 'if', block: [
				{ op: 'drop' },
			{ op: 'else' },
				... index,
				{ op: "i32.const", value: 4 },
				{ op: 'i32.mul' },
				{ op: "i32.store", "flags": 2, "offset": 0 },
			]}
		];
	}

	return index ? [
		{ op: 'i32.const', value: index * 4 },
		{ op: "i32.store", "flags": 2, "offset": 0 }
	] : [
		{ op: "drop" }
	];
}

export function exception(code, pc, delayed, cop = [{ op: 'i32.const', value: 0 }] ) {
	console.log(cop)
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
	    "custom": [],
	    "import_section": [
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
	                "returns": [
	                    "i32"
	                ]
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
	    ],
	}

	// TODO: PACK OUT FUNCTIONS

	return Export(result);
}
