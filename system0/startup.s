	# Reset handler
	.section	.reset
	.align		4
	.globl		main
	.globl		memcpy

	.globl		_STACK_TOP
	.globl		_DATA_ROM
	.globl		_DATA_START
	.globl		_DATA_SIZE
	.long		_reset

_reset:
	# Setup stack pointer
	#la 	$sp, _STACK_TOP

	# Setup initialized ram sections
	ldr r0, =_DATA_START 
	ldr r1, =_DATA_ROM
	ldr r2, =_DATA_SIZE
	bl	memcpy

	# Jump to main
	bl main	
	b   .

	.pool

