import { tick as system_tick } from "./mips";
import { Exceptions } from "./mips/consts";

export { attach, test } from "./gpu";
export { initialize, Registers } from "./mips";

var running = false;
var _adjust_clock;

export function isRunning() {
	return running;
}

export function start () {
	if (running) return ;

	_adjust_clock = +new Date();
	running = true;
	tick();
}

export function stop () {
	running = false;
}

export function tick () {
	const newClock = Date.now();
	const cycles = (newClock - _adjust_clock) * (15000000 / 1000);
	_adjust_clock = newClock;

	if (running && system_tick(cycles)) {
		// Schedule next tick when the CPU is free
		setTimeout(tick, 0);
	}
}

export function read (code, address) {
	throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
	throw Exceptions.BusErrorData;
}
