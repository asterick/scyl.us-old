	# Reset handler
	.section	.reset
	.align		4
	
	.long		_reset
	.long 		_undef_handler
	.long 		_swi_handler
	.long 		_prefetch_aborthandler
	.long 		_data_abort_handler
	.long 		_address_abort_handler
	.long 		_exceed_handler
	.long 		_irq_handler
	.long 		_fiq_handler

	.section	.data
	.bss
	.space		0x10000

_stack_top:

	# Reset / Exception handlers
	.section	.text
	.align		4
	.code		32

_reset:
	.globl		main
	.globl		memcpy

	.globl		_DATA_ROM
	.globl		_DATA_START
	.globl		_DATA_SIZE

	# Setup stack pointer
	ldr 	sp, =_stack_top
	str 	r0, [sp, r1, lsl #2]!

	# Setup initialized ram sections
	ldr r0, =_DATA_START 
	ldr r1, =_DATA_ROM
	ldr r2, =_DATA_SIZE
	bl	memcpy

	# Jump to main
	bl 	main	
	b   .

	.pool


_undef_handler:
_swi_handler:
_prefetch_aborthandler:
_data_abort_handler:
_address_abort_handler:
_exceed_handler:
_irq_handler:
_fiq_handler:
	b 	.
