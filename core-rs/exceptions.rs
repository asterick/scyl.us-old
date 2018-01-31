pub enum Exception {
	INTERRUPT = 0x00,
	TLBMOD = 0x01,
	TLBLOAD = 0x02,
	TLBSTORE = 0x03,
	ADDRESSLOAD = 0x04,
	ADDRESSSTORE = 0x05,
	BUSERRORINSTRUCTION = 0x06,
	BUSERRORDATA = 0x07,
	SYSCALL = 0x08,
	BREAKPOINT = 0x09,
	RESERVEDINSTRUCTION = 0x0A,
	COPROCESSORUNUSABLE = 0x0B,
	OVERFLOW = 0x0C
}

extern {
	fn exception(code: usize, pc: usize, delayed: usize, cop: usize);
}

pub fn throw(e:Exception, pc: usize, delayed: usize, cop: usize) {
	unsafe { exception(e as usize, pc, delayed, cop); }
}
