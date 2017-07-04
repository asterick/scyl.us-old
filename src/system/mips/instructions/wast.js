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

export function readReg(index) {
	return index ? [
		{ op: 'i32.const', value: index * 4 },
		{ "op": "i32.load", "flags": 2, "offset": 0 }
	] : [
		{ op: 'i32.const', value: 0 }
	];
}

export function writeReg(index, value) {
	return index ? value.concat([
		{ op: 'i32.const', value: index * 4 },
		{ "op": "i32.store", "flags": 2, "offset": 0 }
	]) : [];
}
