import MIPS from "./mips";
import { Exceptions } from "./mips/consts";

export default class extends MIPS {
	constructor (bios) {
		super();

		// 4MB of ram
		this.ram = new Uint32Array(0x100000);
		this.rom = new Uint32Array(0x20000);

		this.rom.set(new Uint32Array(bios));
	}

	attach (canvas) {
		// TODO
	}

	read (code, address) {
		if (address < 0x400000) {
			return this.ram[address >>> 2];
		}
		else if (address >= 0x1FC00000 && address < 0x1FC80000) {
			return this.rom[(address >>> 2) & 0x1FFFF];
		}
		
		throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
	}

	write (address, value, mask = ~0) {
		if (address < 0x400000) {
			address >>= 2;
			this.ram[address] = (this.ram[address] & ~mask) | (value & mask);
		}
	}
}
