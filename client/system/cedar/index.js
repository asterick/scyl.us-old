export function read (page, code, logical, pc, delayed) {
	throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
	throw Exceptions.BusErrorData;
}
