/**
 ** | opcode | target | source |
 ** opcode = 5
 ** target = 3 (vector) + 4 (mask out) + 8 (swizzle)
 ** source = 4 (vector) + 8 (swizzle)
 **/

import Export from "../../dynast/export";
import Import from "../../dynast/import";

const DSP_Memory = new WebAssembly.Memory({ initial: 1 });
const DSP_Program = new Uint32Array(1024);
const DSP_Vectors = new Uint32Array(DSP_Memory.buffer, 0, 16 * 4);

const Environment = { env: { memory: DSP_Memory } };

var timing = 0;
var run = null;

function asInt(i) {
	return { op: "i32.load", flags: 2, offset: i }
}

function asFloat(i) {
	return { op: "f32.load", flags: 2, offset: i }
}

const op_table = [
//  0: mov
	{ type: "single", code: (source, target) => [ asFloat(source) ] },
//  1: abs
	{ type: "single", code: (source, target) => [ asFloat(source), 'f32.abs' ] },
//  2: neg
	{ type: "single", code: (source, target) => [ asFloat(source), 'f32.neg' ] },
//  3: floor
	{ type: "single", code: (source, target) => [ asFloat(source), 'f32.floor' ] },
//  4: ceil
	{ type: "single", code: (source, target) => [ asFloat(source), 'f32.ceil' ] },
//  5: round
	{ type: "single", code: (source, target) => [ asFloat(source), 'f32.nearest' ] },
//  6: max
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.max' ] },
//  7: min
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.min' ] },
//  8: add
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.add' ] },
//  9: sub
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.sub' ] },
// 10: mul
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.mul' ] },
// 11: div
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.div' ] },
// 12: sqrt
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.sqrt' ] },
// 13: gt
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.gt', 'f32.convert_s/i32' ] },
// 14: ge
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.ge', 'f32.convert_s/i32' ] },
// 15: lt
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.lt', 'f32.convert_s/i32' ] },
// 16: le
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.ne', 'f32.convert_s/i32' ] },
// 17: eq
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.eq', 'f32.convert_s/i32' ] },
// 18: ne
	{ type: "single", code: (source, target) => [ asFloat(target), asFloat(source), 'f32.ne', 'f32.convert_s/i32' ] },
// 19: dot3
// 20: dot4
// 21: int
	{ type: "single", code: (source, target) => [ asFloat(source), 'i32.trunc_s/f32', 'f32.reinterpret/i32' ] },
// 22: float
	{ type: "single", code: (source, target) => [ asInt(source), 'f32.convert_s/i32' ] },
];

function generate() {
	var code = [];
	var i = 0;

	while (i < DSP_Program.length) {
		const word = DSP_Program[i++];

		const source_swizzle =  word         & 0xFF;
		const target_swizzle = (word >>>  8) & 0xFF;
		const target_mask    = (word >>> 16) & 0b1111;
		const source_index   = (word >>> 20) & 0b1111;
		const target_index   = (word >>> 24) & 0b111;
		const operation 	 = op_table[(word >>> 27)];

		if (!operation) {
 			code.push("return");
 			return code;
		}

		// No-Op
		if (!target_mask) {
			continue ;
		}

		switch (operation.type) {
		case 'single':
			for (var i = 0; i < 4; i++) {
				if (~target_mask & (1 << i)) continue;

				const target = ((target_swizzle >> (i * 2)) & 0b11) * 4 + (target_index * 16);
				const source = ((source_swizzle >> (i * 2)) & 0b11) * 4 + (source_index * 16);

				code.push.apply(code, operation.code(source, target));
			}

			for (var i = 0; i < 4; i++) {
				if (~target_mask & (1 << i)) continue;

				code.push({ op: 'f32.store', flags: 2, offset: target_index * 16 + i * 4 });
			}
			break ;
		}
	}

	return code;
}

function compile() {
	const Module = {
		magicNumber: 0x6d736100,
		version: 1,

		import_section: [{
			field: "memory",
			module: "env",
			type: {
				limits: { type: "resizable_limits", initial: 1, maximum: null },
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
		    "code": generate().concat("end")
		}],

		type_section: [{ type: "func_type", parameters: [], returns: [] }],

		export_section: [{
			"field": "run",
			"kind": "func_type",
			"index": 0
		}]
	};

	console.log(Import(Export(Module)));

	WebAssembly.instantiate(Export(Module), Environment)
		.then((module) => {
			run = module.instance.exports.run;
			run ();
		});
}

DSP_Program[0] = 0b00000001000111110001101100011011;
compile();

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
	} else if (address >= 0x80000 && address <= 0x80000 + DSP_Program.length) {
		run = null;
		DSP_Program[address] = (DSP_Program[address] & ~mask) | (value & mask);
	} else {
		throw Exceptions.BusErrorData;
	}
}
