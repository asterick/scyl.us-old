import exports from "../mips";
import { Exceptions } from "../mips/consts";

/**
 ** | opcode | target | source |
 ** opcode = 8
 ** target = 8 (vector) + 4 (mask out)
 ** left = 8 (vector) + 8 (swizzle)
 ** right = 8 (vector) + 8 (swizzle)
 **/

import Export from "../../../dynast/export";
import Import from "../../../dynast/import";

const DSP_Memory = new WebAssembly.Memory({ initial: 1 });
const DSP_Program = new Uint32Array(1024);
const DSP_Vectors = new Uint32Array(DSP_Memory.buffer, 0, 256 * 4);

const Environment = { env: { memory: DSP_Memory } };

var timing = 0;
var run = null;

const asInt = { op: "i32.load", flags: 2, offset: 0 };
const asFloat = { op: "f32.load", flags: 2, offset: 0 };

const op_table = [
//  0: mov
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat ] },
//  1: abs
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.abs' ] },
//  2: neg
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.neg' ] },
//  3: floor
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.floor' ] },
//  4: ceil
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.ceil' ] },
//  5: round
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.nearest' ] },
//  6: sqrt
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'f32.sqrt' ] },
//  7: max
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.max' ] },
//  8: min
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.min' ] },
//  9: add
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.add' ] },
// 10: sub
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.sub' ] },
// 11: mul
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.mul' ] },
// 12: div
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.div' ] },
// 13: gt
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.gt', 'f32.convert_s/i32' ] },
// 14: ge
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.ge', 'f32.convert_s/i32' ] },
// 15: lt
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.lt', 'f32.convert_s/i32' ] },
// 16: le
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.ne', 'f32.convert_s/i32' ] },
// 17: eq
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.eq', 'f32.convert_s/i32' ] },
// 18: ne
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: right }, asFloat, { op: 'i32.const', value: left }, asFloat, 'f32.ne', 'f32.convert_s/i32' ] },
// 19: dot3
	{ type: "combine", code: (left, right) => [
		 { op: 'i32.const', value: left[0] }, asFloat,
		 { op: 'i32.const', value: right[0] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'i32.const', value: left[1] }, asFloat,
		 { op: 'i32.const', value: right[1] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'f32.add' },
		 { op: 'i32.const', value: left[2] }, asFloat,
		 { op: 'i32.const', value: right[2] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'f32.add' }
	] },
// 20: dot4
	{ type: "combine", code: (left, right) => [
		 { op: 'i32.const', value: left[0] }, asFloat,
		 { op: 'i32.const', value: right[0] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'i32.const', value: left[1] }, asFloat,
		 { op: 'i32.const', value: right[1] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'f32.add' },
		 { op: 'i32.const', value: left[2] }, asFloat,
		 { op: 'i32.const', value: right[2] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'f32.add' },
		 { op: 'i32.const', value: left[3] }, asFloat,
		 { op: 'i32.const', value: right[3] }, asFloat,
		 { op: 'f32.mul' },
		 { op: 'f32.add' }
	] },
// 21: int
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asFloat, 'i32.trunc_s/f32', 'f32.reinterpret/i32' ] },
// 22: float
	{ type: "single", code: (left, right) => [ { op: 'i32.const', value: left }, asInt, 'f32.convert_s/i32' ] },
];

const bit_count = [ 0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4 ];

function generate() {
	var code = [];
	var i = 0;

	while (i < DSP_Program.length) {
		const a = DSP_Program[i++];
		const b = DSP_Program[i++];

		const operation 	= op_table[(a >>> 24)];
		const target_mask   = (a >>>  0) & 0b1111;
		const target_index  = (a >>>  8) & 0xFF;

		const left_swizzle 	= (b >>>  0) & 0xFF;
		const left_index 	= (b >>>  8) & 0xFF;
		const right_swizzle = (b >>> 16) & 0xFF;
		const right_index 	= (b >>> 24) & 0xFF;

		if (!operation) {
 			// Terminate
 			break ;
		}

		// No-Op
		if (!target_mask) {
			continue ;
		}

		switch (operation.type) {
		case 'single':
			for (var i = 3; i >= 0; i--) {
				if (~target_mask & (1 << i)) continue;

				const left = ((left_swizzle >> (i * 2)) & 0b11) * 4 + (left_index * 16);
				const right = ((right_swizzle >> (i * 2)) & 0b11) * 4 + (right_index * 16);

				code.push({ op: 'i32.const', value: 0 });
				code.push.apply(code, operation.code(left, right));
			}

			for (var i = 0; i < 4; i++) {
				if (~target_mask & (1 << i)) continue;

				code.push({ op: 'f32.store', flags: 2, offset: target_index * 16 + i * 4 });
			}
			break ;

		case 'combine':
			let assigned = false;

			for (var i = 0; i < bit_count[target_mask]; i++) {
				code.push({ op: 'i32.const', value: 0 });
			}

			// Combine stage
			let left = [], right = [];
			for (var i = 0; i < 4; i++) {
				left.push(((left_swizzle >> (i * 2)) & 0b11) * 4 + (left_index * 16));
				right.push(((right_swizzle >> (i * 2)) & 0b11) * 4 + (right_index * 16));
			}

			code.push.apply(code, operation.code(left, right))

			for (var i = 0; i < 4; i++) {
				if (~target_mask & (1 << i)) continue;

				code.push({ op: assigned ? 'get_local' : 'tee_local', index: 0 });
				code.push({ op: 'f32.store', flags: 2, offset: target_index * 16 + i * 4 });
				assigned = true;
			}
		}
	}

	console.log(code);

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
		    "locals": [{ count: 1, type: "f32" }],
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

export function read (page, code, logical, pc, delayed) {
	// TODO: CONTROL REGISTER
	if (address < DSP_Vectors.length) {
		return DSP_Vectors[address];
	} else if (address >= 0x80000 && address <= 0x800FF) {
		return DSP_Program[address];
	} else {
		exports.bus_fault(code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData, logical, pc, delayed);
	}
}

export function write (address, value, mask, pc, delayed) {
	// TODO: CONTROL REGISTER
	if (address < DSP_Vectors.length) {
		DSP_Vectors[address] = (DSP_Vectors[address] & ~mask) | (value & mask);
	} else if (address >= 0x80000 && address <= 0x80000 + DSP_Program.length) {
		run = null;
		DSP_Program[address] = (DSP_Program[address] & ~mask) | (value & mask);
	} else {
		exports.bus_fault(Exceptions.BusErrorData, address, pc, delayed);
	}
}
