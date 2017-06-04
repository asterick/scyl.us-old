SECTIONS
{
	. = 0xbcf00000;
	.text : { *(.text) }

	_DATA_START = .;
	.data : { *(.data) }
   	_DATA_END = ABSOLUTE(.);
   	.bss : { *(.bss) }

}
