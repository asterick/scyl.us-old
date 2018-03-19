import Exception from "./exception";
import { Exceptions } from "./mips/consts";

/****
 DMA CHANNEL REGISTER MAP
 ------------------------
 N+0 Flags
 N+1 Start Address
 N+2 End Address
 N+3 DMA Length

 Flags
 -------------------------
   31: Running
   30: Circular mode
16~23: Write stride (signed)
 8~15: Read stride (signed)
 6~ 7: Write width (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Packed)
 4~ 5: Read width  (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Packed)
 0~ 3: Trigger channel

 Trigger Channels
 -------------------------
   0: Always running
   1: GPU RX Fifo not-full
   2: GPU TX Fifo not-empty
   3: DSP Idle
   4: DSP Complete
 ****/

import { regions } from "../mips";
import { read as system_read, write as system_write } from "..";

export function read (page, code, logical, pc, delayed) {
	throw new Exception(code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData, pc, delayed, 0);
}

export function write (address, value, mask = ~0) {
	throw new Exception(Exceptions.BusErrorData, pc, delayed, 0);
}
