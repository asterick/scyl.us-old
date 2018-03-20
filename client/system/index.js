import { block_execute } from "./mips";
import { Exceptions, SYSTEM_CLOCK, MAX_CLOCK_LATENCY } from "./mips/consts";

export { attach } from "./gpu";
export { reset as cpu_reset, initialize, registers, load, step_execute } from "./mips";

import Registers from "./mips/registers";

export var running = false;

var adjust_clock;

export function reset () {
	cpu_reset();
}

export function start () {
	if (running) return ;

	adjust_clock = +new Date();
	running = true;
	tick();
}

export function stop () {
	running = false;
}

export function tick () {
	// We have deferred execution (JIT compiler delay)
	if (block_execute()) {
		return ;
	}

	// TODO: Time out perfs

	// System is caught up, advance our CPU clock since last execution
	const newClock = Date.now();
	const cycles = Math.min(MAX_CLOCK_LATENCY, (newClock - adjust_clock) * (SYSTEM_CLOCK / 1000));
	adjust_clock = newClock;

	// Allocate some more cycles for the CPU
	Registers.clocks += cycles;

	// Schedule next tick when the CPU is free
	if (running) setTimeout(tick, 0);
}
