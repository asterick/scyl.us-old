import Exception from "./exception";
import { Exceptions } from "./mips/consts";

export function read (page, code, logical, pc, delayed) {
	throw new Exception(code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData, pc, delayed, 0);
}

export function write (address, value, mask = ~0) {
	throw new Exception(Exceptions.BusErrorData, pc, delayed, 0);
}
