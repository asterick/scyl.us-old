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

export function read(index) {
	return index ? [
		{ op: 'i32.const', value: index * 4 },
		{ op: "i32.load", "flags": 2, "offset": 0 }
	] : [
		{ op: 'i32.const', value: 0 }
	];
}

export function write(index, value) {
	return index ? [
		{ op: 'i32.const', value: index * 4 },
		{ op: "i32.store", "flags": 2, "offset": 0 }
	] : [
		{ op: "drop" }
	];
}

export function exception(code, pc, delayed, cop = 0) {
	return [
        { op: 'i32.const', value: code },
        { op: 'i32.const', value: pc },
        { op: 'i32.const', value: delayed ? 1 : 0 },
        { op: 'i32.const', value: cop },
        { op: "call", function_index: CALLS.EXCEPTION },
        { op: "unreachable" }
	]
}
