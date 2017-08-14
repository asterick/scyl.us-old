import MIPS from "./mips";
import GPU from "./gpu";

import { Exceptions } from "./mips/consts";

export default class extends MIPS {
	constructor (bios) {
		super();

		this._gpu = new GPU(this);
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
		const newClock = +new Date();
		const cycles = newClock - this._adjust_clock;
		this._adjust_clock = newClock;

		if (this.running && this._tick(cycles)) {
			// Schedule next tick when the CPU is free
			setTimeout(this.tick, 0);
		}
	}

	attach (canvas) {
		this._gpu.attach(canvas);
	}

	resize () {
		this._gpu.resize();
	}

	read (code, address) {
		debugger ;
		throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
	}

	write (address, value, mask = ~0) {
		throw Exceptions.BusErrorData;
	}
}
