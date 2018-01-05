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
 6~7: Write width (0 = 8-bit, 1 = 16-bit, 2 = 32-bit, 3 = Packed)
 4~5: Read width  (0 = 8-bit, 1 = 16-bit, 2+ = 32-bit)
 0~3: Trigger channel

 Trigger Channels
 -------------------------
   0: Always running
   1: GPU RX Fifo not-full
   2: GPU TX Fifo not-empty
   3: DSP Idle
   4: DSP Complete
 ****/

export function read (code, address) {
	throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
	throw Exceptions.BusErrorData;
}
