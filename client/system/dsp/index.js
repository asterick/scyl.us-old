/**
 ** | opcode |  target | source | dest |
 ** opcode   = 5
 ** target   = 3 (vector) + 4 (mask out) + 8 (in swizzle)
 ** source b = 4 (vector) + 8 (swizzle)
 **
 ** Opcodes
 **   0: mov
 **   1: abs
 **   2: neg
 **   3: max
 **   4: min
 **   5: floor
 **   6: ceil
 **   7: round
 **   8: add
 **   9: sub
 **  10: mul
 **  11: div
 **  12: dot3
 **  13: dot4
 **  14: sqrt
 **  15: gt
 **  16: ge
 **  17: lt
 **  18: le
 **  19: eq
 **  20: ne
 **/

import Export from "../../dynast/export";

const DSP_Memory = WebAssembly.Memory({ initial: 1 });
const DSP_Program = new Uint32Array(1024);
const DSP_Vectors = new Uint32Array(DSP_Memory.buffer, 0, 256 * 4);

const Environment = { env: { memory: DSP_Memory } };

var run = null;

function compile() {
	const Module = Export({
		magicNumber: 0x6d736100,
		version: 1,

		import_section: [{
			field: "memory",
			module: "env",
			type: {
				limits: { type: "resizable_limits", initial: 0, maximum: null },
				type: "memory_type"
			}
		}],
		function_section: [{
		    "type": {
		        "type": "func_type",
		        "parameters": [],
		        "returns": []
		    },
		    "locals": [],
		    "code": [
		    	"end"
		    ]
		}],

		type_section: [{ type: "func_type", parameters: [], returns: [] }],

		export_section: [{
			"field": "run",
			"kind": "func_type",
			"index": 0
		}]
	});

	WebAssembly.instantiate(Module, Environment)
		.then((module) => {
			run = module.instance.exports.run;
			run ();
		});
}

export function read (code, address) {
	// TODO: CONTROL REGISTER
	if (address < DSP_Vectors.length) {
		return DSP_Vectors[address];
	} else if (address >= 0x80000 && address <= 0x800FF) {
		return DSP_Program[address];
	} else {
		throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
	}
}

export function write (address, value, mask) {
	// TODO: CONTROL REGISTER
	if (address < DSP_Vectors.length) {
		DSP_Vectors[address] = (DSP_Vectors[address] & ~mask) | (value & mask);
	} else if (address >= 0x80000 && address <= 0x800FF) {
		run = null;
		DSP_Program[address] = (DSP_Program[address] & ~mask) | (value & mask);
	} else {
		throw Exceptions.BusErrorData;
	}
}
