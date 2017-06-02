export default class {
	constructor() {
	}

	_trap(e) {
		// TODO: Trap to COP0
		throw e
	}

	_translate(address) {
		// TODO: VALIDATE KERNEL / USER PERMISSIONS
		// TODO: LOOK THROUGH TLB
		switch (address & 0xE0000000) {
		// KUSEG (TRANSLATED, CACHED)
		case 0x0000000: case 0x2000000: case 0x4000000: case 0x6000000:
		// KSEG0 (KERNEL, CACHED)
		case 0x8000000:
		// KSEG1 (KERNEL)
		case 0xA000000:
		// KSEG2 (KERNEL, CACHED, TRANSLATED)
		case 0xC000000: case 0xE000000:
		}

		return address & 0x7FFFFFFC;
	}
}
