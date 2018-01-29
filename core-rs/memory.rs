#[repr(C)]
struct Region {
	base: u32,
	length: usize,
	address: *const u32,
	flags: u32
}

extern {
	fn setMemoryRegions(address: &[Region; 2]);
}

const FLAG_R: u32 = 1;
const FLAG_W: u32 = 2;
const FLAG_LAST: u32 = 4;

const ROM_BASE:u32 		= 0x1FC00000;
const ROM_SIZE:usize 	= 512*1024;
const RAM_BASE:u32 		= 0;
const RAM_SIZE:usize 	= 4*1024*1024;

const  BOOT_ROM: [u32; ROM_SIZE] = [0; ROM_SIZE];
static mut MAIN_RAM: [u32; RAM_SIZE] = [0; RAM_SIZE];

pub fn reset() {
	unsafe {
		let regions: [Region; 2] = [
			Region {
				//name: "boot".as_ptr(),
				base: ROM_BASE,
				length: ROM_SIZE,
				flags: FLAG_R,
				address: &BOOT_ROM[0]
			},
			Region {
				//name: "m_ram".as_ptr(),
				base: RAM_BASE,
				length: RAM_SIZE,
				flags: FLAG_R | FLAG_W | FLAG_LAST,
				address: &MAIN_RAM[0]
			}
		];

		setMemoryRegions(&regions);
	}
}

/*
uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, code, pc, delayed);

	if (physical < sizeof(ram)) {
		return ram[physical >> 2];
	} else if (physical >= ROM_BASE && physical < (ROM_BASE + ROM_SIZE)) {
		physical = physical - ROM_BASE;

		if (physical >= sizeof(rom)) return 0;

		return rom[physical >> 2];
	} else {
		return read(physical, code, pc, delayed);
	}
}

void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed) {
	uint32_t physical = translate(logical, 1, pc, delayed);

	if (physical < sizeof(ram)) {
		physical >>= 2;
		invalidate(physical, logical);
		ram[physical] = (ram[physical] & ~mask) | (value & mask);
	} else if (physical < ROM_BASE || physical >= (ROM_BASE + ROM_SIZE)) {
		write(physical, value, mask, pc, delayed);
	}
}
*/
