R3000 System documentation
============

This is a brief overview of the R3000 based computer for my website (yet unnamed)

Memory Layout
--------------

##### Physical memory space

| Start      | End        | Length | Type          |
| ---------- | ---------- | ------ | ------------- |
| 0x00000000 | 0x003FFFFF | 4MB    | System Memory |
| 0x1F000000 | 0x1FBFFFFF | 12MB   | I/O Space     |
| 0x1FC00000 | 0x1FC80000 | 512KB  | Boot Rom      |

All unmapped spaces will produce a bus exception

##### I/O memory space

| Start      |      System |
| ---------- | ----------- |
| 0x1F000000 |       [DMA] |
| 0x1F100000 |    [Timers] |
| 0x1F200000 | [Cedar Bus] |
| 0x1F300000 |       [GPU] |
| 0x1F400000 |       [DSP] |
| 0x1F500000 |       [SPU] |

CPU (MIPS R3000)
-----

CPU is a stock R3000 with a custom COP0 (page-table based instead of software TLB fill)
The segments have been altered slightly to accomidate this function.  

NOTE: that caching is not actually simulated, it is only included if I ever make this real

| Name  |      Start |        End | Remapped | Cached | Supervisor |
| ----- | ---------- | ---------- | -------- | ------ | ---------- |
| KUser | 0x00000000 | 0x7FFFFFFF |     True |  Table |      Table |
| KSpr0 | 0x80000000 | 0xBFFFFFFF |     True |  Table |       True | 
| KSpr1 | 0xC0000000 | 0xDFFFFFFF |    False |  False |       True |
| KSpr2 | 0xE0000000 | 0xFFFFFFFF |    False |   True |       True |


Page table register
0xAAAAAFFF

lll?_kgpp_pppp
lll?_kgpp_pppp


cached / ro
priviledged
global	(1 = ignore PID)
length 	(0 = not a page pointer)
pid
(read only flag?)

Setting the page table address to 0x00000E00 disables page lookups
Page tables must be 4kB aligned

NOTE: I enforce Supervisor mode is enforced for 0x80000000+ for security reasons

Root Counters (Timers)
--------
TODO

DMA Engine
---------
TODO

Cedar Bus
----------
Used for removable devices / media

DSP Engine
---

TODO

GPU
----

TODO

SPU
----

TODO

Block Media Devices
----

TODO

