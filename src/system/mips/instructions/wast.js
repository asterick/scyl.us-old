export const REG_LO = 32;
export const REG_HI = 33;
export const REG_PC = 34;

export const CALL_EXCEPTION = 0;
export const CALL_LOAD		= 1;
export const CALL_STORE		= 2;
export const CALL_MFC0		= 3;
export const CALL_MTC0		= 4;
export const CALL_RFE		= 5;
export const CALL_TLBR		= 6;
export const CALL_TLBWI		= 7;
export const CALL_TLBWR		= 8;
export const CALL_TLBP		= 9;

export function const32(value) {
	return [ { op: 'i32.const', value: value } ]
}

export function const64(value) {
	return [ { op: 'i64.const', value: value } ]
}

export function read(index) {
	return index ? [ 
		const32(index*4),
		{ "op": "i32.load", "flags": 2, "offset": 0 } 
	] : const32(0);
}

export function write(index, value) {
	return index ? value.concat([
		const32(index*4),
		{ "op": "i32.store", "flags": 2, "offset": 0 } 
	]) : []
}

export function dropWrite(index, value) {
	return value.concat(index ? [
		const32(index*4),
		{ "op": "i32.store", "flags": 2, "offset": 0 } 
	] : { op: "drop" })
}

export function call(func, ... args) {
	return args.concat(func, {
        "op": "call",
        "function_index": func
    } );
}
