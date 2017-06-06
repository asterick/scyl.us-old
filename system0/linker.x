SECTIONS
{
	.text 0xbfc00000 : {
		*(.reset)
		. = 0x100;
		*(.tlb)
		. = 0x180;
		*(.exception)
		*(.text)
		*(.rodata)
	}
	_DATA_START = .;

	. = 0x80020000;
	_STACK_START = .;
	_DATA_TARGET = .;
	.data : { *(.data) }
   	_DATA_SIZE = . - _DATA_TARGET;
   	.bss : { *(.bss) }
}
