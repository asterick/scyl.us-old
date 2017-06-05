SECTIONS
{
	.text 0xbcf00000 : {
		*(.reset)
		. = 0x80;
		*(.tlb)
		. = 0x100;
		*(.exception)
		*(.text)
	}

	_DATA_START = .;
	. = 0x80000000;
	_DATA_TARGET = ABSOLUTE(.);
	.data : { *(.data) }
   	_DATA_SIZE = . - _DATA_TARGET;
   	.bss : { *(.bss) }
}
