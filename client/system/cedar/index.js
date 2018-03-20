import exports from "..";
import { Exceptions } from "../consts";

export function read (physical, code, logical, pc, delayed) {
	exports.bus_fault(code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData, logical, pc, delayed);
}

export function write (physical, value, mask, logical, pc, delayed) {
    exports.bus_fault(Exceptions.BusErrorData, logical, pc, delayed);
}
