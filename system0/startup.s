	# Reset handler
	.section	.reset, "ax", @progbits
	.align		4
	.globl		main

_reset:
	li 	$sp, 0x80400000	# Initialize the stack to the top of memory
	jal main
	j   _reset

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
