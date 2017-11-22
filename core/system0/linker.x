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
	. = ALIGN(8);
	_DATA_ROM = .;

	. = 0x80020000;
	_STACK_TOP = .;
	_DATA_START = .;
	.data : { *(.data) }
	. = ALIGN(4);
   	_DATA_SIZE = . - _DATA_START;

   	_BSS_START = .;
   	.bss : { *(.bss) }
   	_BSS_END = .;
}
