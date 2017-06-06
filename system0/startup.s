	# Reset handler
	.section	.reset, "ax", @progbits
	.align		4
	.globl		main
	.globl		_STACK_TOP

_reset:
	la 	$sp, _STACK_TOP
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
