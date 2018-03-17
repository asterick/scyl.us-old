	# Reset handler
	.section	.reset, "ax", @progbits
	.align		4
	.globl		main
	.globl		_STACK_TOP
	.globl		_DATA_ROM
	.globl		_DATA_START
	.globl		_DATA_SIZE
	.globl		memcpy

_reset:
	# Setup stack pointer
	la 	$sp, _STACK_TOP

	# Setup initialized ram sections
	la	$a0, _DATA_START
	la	$a1, _DATA_ROM
	la	$a2, _DATA_SIZE
	jal	memcpy

	# Jump to main
	jal main
	
	j   .

	# TLB Exception handler
	.section	.tlb, "ax", @progbits
	.align		4
_tlb:
	j	_tlb
	nop

	# General Exception handler
	.section	.exception, "ax", @progbits

_exception:
	j	_exception
	nop
