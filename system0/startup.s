	# Reset handler
	.section	.reset
	.align		4
	.globl		main
	.globl		memcpy

_reset:
	# Setup stack pointer
	la 	sp, _STACK_TOP

	# Setup initialized ram sections
	la	a0, _DATA_START
	la	a1, _DATA_ROM
	la	a2, _DATA_SIZE
	jal	memcpy

	# Jump to main
	jal main
	j   .
