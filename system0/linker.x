SECTIONS
{
	. = 0xbcf00000;

	.reset ALIGN(0x80): { *(.reset); }
	.tlb ALIGN(0x80): { *(.reset); }
	.exception ALIGN(0x80): { *(.reset); }
	.text : {  *(.text); }

	. = 0xb0000000;
	PROVIDE(DATA_START = .);
	.data : { *(.data) }
	PROVIDE(DATA_END = .);
	.bss : { *(.bss) }
	PROVIDE(BSS_END = .);
}
