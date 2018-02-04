use std::mem::size_of_val;
use cop0::translate;

const FLAG_R: usize 	= 1;
const FLAG_W: usize 	= 2;
const FLAG_LAST: usize 	= 4;

const ROM_BASE: usize	= 0x1FC00000;
const ROM_SIZE: usize	= 512*1024;
const RAM_BASE: usize	= 0;
const RAM_SIZE: usize	= 4*1024*1024;

#[repr(C)]
struct MemoryRegion {
	base: usize,
	size: usize,
	data: *const usize,
	flags: usize
}

static mut ROM_DATA: [usize; ROM_SIZE / 4] = [0; ROM_SIZE / 4];
static mut RAM_DATA: [usize; RAM_SIZE / 4] = [0; RAM_SIZE / 4];

extern {
	fn setMemoryRegions(address: &[MemoryRegion; 2]);
	fn read(address: usize, code: usize, pc: usize, delayed: usize) -> usize;
	fn write(address: usize, value: usize, mask: usize, pc: usize, delayed: usize) -> usize;
	fn invalidate(physical: usize, logical: usize);
}

pub fn reset() {
	unsafe {
		let memory_regions: [MemoryRegion; 2] = [
		    MemoryRegion { base: ROM_BASE, size: size_of_val(&ROM_DATA), data: &ROM_DATA[0], flags: FLAG_R },
		    MemoryRegion { base: RAM_BASE, size: size_of_val(&RAM_DATA), data: &RAM_DATA[0], flags: FLAG_R | FLAG_W | FLAG_LAST },
		];

		setMemoryRegions(&memory_regions);
	}
}

#[no_mangle]
pub fn load (logical: usize, code: usize, pc: usize, delayed: usize) -> usize {
	let physical: usize = translate(logical, code, pc, delayed);

	unsafe {
		if physical < RAM_SIZE {
			RAM_DATA[physical >> 2]
		} else if physical >= ROM_BASE && physical < (ROM_BASE + ROM_SIZE) {
			ROM_DATA[(physical - ROM_BASE) >> 2]
		} else {
			read(physical, code, pc, delayed)
		}
	}
}

#[no_mangle]
pub fn store (logical: usize, value: usize, mask: usize, pc: usize, delayed: usize) {
	let physical: usize = translate(logical, 1, pc, delayed) >> 2;

	unsafe {
		if physical < RAM_SIZE {
			let ram_address = physical >> 2;
			invalidate(ram_address, logical);

			RAM_DATA[ram_address] = (RAM_DATA[ram_address] & !mask) | (value & mask);
		} else {
			let rom_address = (physical - ROM_BASE) >> 2;

			if rom_address < ROM_SIZE {
				write(physical, value, mask, pc, delayed);
			}
		}
	}
}
