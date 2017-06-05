SECTIONS
{
	.text 0xbfc00000 : {
		*(.reset)
		. = 0x100;
		*(.tlb)
		. = 0x180;
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
