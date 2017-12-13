import MIPS from "./mips";
import GPU from "./gpu";

import { Exceptions } from "./mips/consts";

export default class extends MIPS {
	constructor (container) {
		super();

		this._gpu = new GPU(container, this);
		this.tick = this.tick.bind(this);
	}

	start () {
		if (this.running) return ;

		this._adjust_clock = +new Date();
		this.running = true;
		this.tick();
	}

	stop () {
		this.running = false;
	}

	tick () {
		const newClock = Date.now();
		const cycles = (newClock - this._adjust_clock) * (15000000 / 1000);
		this._adjust_clock = newClock;

		if (this.running && this._tick(cycles)) {
			// Schedule next tick when the CPU is free
			setTimeout(this.tick, 0);
		}
	}

	read (code, address) {
		throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
	}

	write (address, value, mask = ~0) {
		throw Exceptions.BusErrorData;
	}
}
