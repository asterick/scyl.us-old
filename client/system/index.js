import MIPS from "./mips";
import { attach, test } from "./gpu";

import { Exceptions } from "./mips/consts";

export default class extends MIPS {
	constructor () {
		super();

		this.tick = this.tick.bind(this);
	}

	attach(container) {
		attach(container);
		test();
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
