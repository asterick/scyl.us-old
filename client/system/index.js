import { block_execute } from "./mips";
import { Exceptions, SYSTEM_CLOCK, MAX_CLOCK_LATENCY } from "./mips/consts";

export { attach } from "./gpu";
export { reset as cpu_reset, initialize, registers, load, step } from "./mips";

import { read as dma_read, write as dma_write } from "./dma";
import { read as timer_read, write as timer_write } from "./timer";
import { read as cedar_read, write as cedar_write } from "./cedar";
import { read as spu_read, write as spu_write } from "./spu";
import { read as dsp_read, write as dsp_write } from "./dsp";
import { read as gpu_read, write as gpu_write } from "./gpu";

import Registers from "./mips/registers";

export var running = false;

var _clock;
var _adjust_clock;

export function reset () {
	cpu_reset();
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
	// We have deferred execution (JIT compiler delay)
	if (block_execute()) {
		return ;
	}

	// TODO: Time out perfs

	// System is caught up, advance our CPU clock since last execution
	const newClock = Date.now();
	const cycles = Math.min(MAX_CLOCK_LATENCY, (newClock - _adjust_clock) * (SYSTEM_CLOCK / 1000));
	_adjust_clock = newClock;

	// Allocate some more cycles for the CPU
	Registers.clocks += cycles;
	_clock += cycles;

	// Schedule next tick when the CPU is free
	if (running) setTimeout(tick, 0);
}

export function read (code, address) {
	const page = address & 0xFFFFF;

	switch (address & 0x1FF00000) {
		case 0x1F000000: return dma_read(code, page);
		case 0x1F100000: return timer_read(code, page);
		case 0x1F200000: return cedar_read(code, page);
		case 0x1F300000: return gpu_read(code, page);
		case 0x1F400000: return dsp_read(code, page);
		case 0x1F500000: return spu_read(code, page);
		case 0x1F600000: break ;
		case 0x1F700000: break ;
		case 0x1F800000: break ;
		case 0x1F900000: break ;
		case 0x1FA00000: break ;
		case 0x1FB00000: break ;
	}

	throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
	const page = address & 0xFFFFF;

	switch (address & 0x1FF00000) {
		case 0x1F000000: dma_write(page, value, mask); break ;
		case 0x1F100000: timer_write(page, value, mask); break ;
		case 0x1F200000: cedar_write(page, value, mask); break ;
		case 0x1F300000: gpu_write(page, value, mask); break ;
		case 0x1F400000: dsp_write(page, value, mask); break ;
		case 0x1F500000: spu_write(page, value, mask); break ;
		case 0x1F600000: break ;
		case 0x1F700000: break ;
		case 0x1F800000: break ;
		case 0x1F900000: break ;
		case 0x1FA00000: break ;
		case 0x1FB00000: break ;
	}

	throw Exceptions.BusErrorData;
}
