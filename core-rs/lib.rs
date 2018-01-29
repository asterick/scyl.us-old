mod registers;
mod memory;
mod cop0;
mod hash;
mod exceptions;
mod imports;

#[no_mangle]
pub fn reset() {
	registers::reset();
	memory::reset();
	cop0::reset();
}

/*
// This is a template function for executing
fn execute_call(uint32_t start, uint32_t length) {
    while (registers.clocks > 0) {
        uint32_t index = ((registers.start_pc = registers.pc) - start) >> 2;
        if (index >= length) break ;
        ((exec_block)(index))();
    }
}
*/

pub fn finalize_call(end: u32) {
    unsafe {
	    registers::REGISTERS.pc = end;
	    registers::REGISTERS.clocks -= ((end - registers::REGISTERS.start_pc) >> 2) as i32;
    }
}

pub fn adjust_clock(end: u32) {
    unsafe {
	    registers::REGISTERS.clocks -= ((end - registers::REGISTERS.start_pc) >> 2) as i32;
	}
}
