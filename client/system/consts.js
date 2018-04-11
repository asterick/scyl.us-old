export const MIN_COMPILE_SIZE	= 0x1000;				// One TLB page
export const MAX_COMPILE_SIZE	= 0x10000;				// 64K blocks are the maximum block compile size
export const SYSTEM_CLOCK		= 15000000;				// 15mhz core clock

export const Conditions = [ "eq", "ne", "cs", "cc", "mi", "pl", "vs", "vc", "hi", "ls", "ge", "lt", "gt", "le", "", "nv" ];
export const Registers = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "sp", "lr", "pc" ];
