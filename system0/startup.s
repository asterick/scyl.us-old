	.section	reset, "ax", @progbits
	.align	2
	.globl	_reset
	.globl	main
_reset:
	#la	$r0, main
	j	main
	nop
