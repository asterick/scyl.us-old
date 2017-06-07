import MIPS from "./mips";
import GPU from "./gpu";

import { Exceptions } from "./mips/consts";

export default class extends MIPS {
	constructor (bios) {
		super();

		this._gpu = new GPU(this);
		this._ram = new Uint32Array(0x100000);
		this._rom = new Uint32Array(0x20000);

		// Copy in our bios (and discard it)
		this._rom.set(new Uint32Array(bios));

		this.start();
	}

	start () {
		this._adjust_clock = +new Date();
		this._requestFrame = () => this.tick();
		this._animationFrame = window.requestAnimationFrame(this._requestFrame);
		this.running = true;
	}

	stop () {
		window.cancelAnimationFrame(this._animationFrame);
		this._animationFrame = null;
		this.running = false;
	}

	tick () {
		const newClock = +new Date();
		const ticks = Math.min(20, newClock - this._adjust_clock);
		this._adjust_clock = newClock;
		this._animationFrame = window.requestAnimationFrame(this._requestFrame);

		//this._tick(ticks);

		this._gpu.repaint();
	}

	attach (canvas) {
		this._gpu.attach(canvas);
	}

	resize () {
		this._gpu.resize();
	}

	blockSize(address) {
		if (address >= 0x1FC00000 && address < 0x1FC80000) {
			return this._rom.length;
		}

		// Use the default page size
	}

	read (code, address) {
		if (address < 0x400000) {
			return this._ram[address >>> 2];
		}
		else if (address >= 0x1FC00000 && address < 0x1FC80000) {
			return this._rom[(address >>> 2) & 0x1FFFF];
		}

		throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
	}

	write (address, value, mask = ~0) {
		if (address < 0x400000) {
			address >>= 2;
			this._ram[address] = (this._ram[address] & ~mask) | (value & mask);
		}
	}
}
