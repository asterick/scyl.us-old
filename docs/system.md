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

| Start      | End        | Length | System |
| ---------- | ---------- | ------ | ------ |
| 0x1F000000 | 0x1F0FFFFF |        |        |
| 0x1F100000 |            |        |        |
| 0x1F200000 |            |        |        |

CPU (MIPS R3000)
-----
TODO

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

