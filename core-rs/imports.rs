// These are the javascript unsafe functions (bindings)
extern {
	//pub fn execute(address: u32, delayed: u32);
	pub fn exception(code: u32, pc: u32, delayed: u32, cop: u32) -> u32;
	//pub fn read(address: u32, code: u32, pc: u32, delayed: u32) -> u32;
	//pub fn write(address: u32, value: u32, mask: u32, pc: u32, delayed: u32) -> u32;
	//pub fn invalidate(physical: u32, logical: u32);
}
