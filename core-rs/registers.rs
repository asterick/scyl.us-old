#[repr(C)]
pub struct RegisterSpace {
	pub registers: [u32; 32],
	pub wide: u64,
	pub pc: u32,
	pub start_pc: u32,
	pub clocks: i32
}


pub static mut REGISTERS: RegisterSpace = RegisterSpace {
	registers: [0; 32],
	wide: 0,
	pc: 0,
	start_pc: 0,
	clocks: 0
};

extern {
	fn setRegisterSpace(address: &RegisterSpace);
}

pub fn reset() {
	unsafe {
		setRegisterSpace(&REGISTERS);

    	REGISTERS.pc = 0xBFC00000;
    	REGISTERS.clocks = 0;
	}
}
