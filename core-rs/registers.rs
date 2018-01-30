#[repr(C)]
pub struct RegisterSpace {
	pub regs: [usize; 32],
	pub wide: u64,
	pub pc: usize,
	pub start_pc: usize,
	pub clocks: isize
}

pub static mut REGISTERS: RegisterSpace = RegisterSpace {
	regs: [0; 32],
	wide: 0,
	pc: 0,
	start_pc: 0,
	clocks: 0
};

extern {
	fn setRegisterSpace(space: *const RegisterSpace);
}

pub fn reset() {
    unsafe {
        REGISTERS.pc = 0xBFC00000;
        REGISTERS.clocks = 0;
        setRegisterSpace(&REGISTERS);
    }
}
