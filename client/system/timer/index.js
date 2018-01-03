export function read (code, address) {
	throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
	throw Exceptions.BusErrorData;
}
