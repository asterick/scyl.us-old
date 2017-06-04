SECTIONS
{
	. = 0xbfc00000;
	.text : { *(.text) }
	. = 0xb0000000;
	.data : { *(.data) }
	.bss : { *(.bss) }
}
