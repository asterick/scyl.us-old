import exports from "../mips";
import { Exceptions } from "../mips/consts";

export function read (page, code, logical, pc, delayed) {
	exports.bus_fault(code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData, logical, pc, delayed);
}

export function write (address, value, mask, pc, delayed) {
	exports.bus_fault(Exceptions.BusErrorData, address, pc, delayed);
}
