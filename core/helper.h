// These are the functions that get inlined
STATIC_FUNCTION uint32_t read_reg(int reg) {
	return reg ? registers[reg] : 0;
}

STATIC_FUNCTION void write_reg(int reg, uint32_t value) {
	if (reg) registers[reg] = value;
}
