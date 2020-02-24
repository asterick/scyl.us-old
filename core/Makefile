OBJECTS = mips/cop0.o mips/base.o mips/table.o dma/dma.o timer/timer.o gpu/gpu.o spu/spu.o cedar/cedar.o memory.o core.o 
TARGET = "../assets/core.wasm"
ROM = "../system0/code.bin"
SYSTEM0 =  ../system0/code.bin ../system0/data.bin

CFLAGS = --target=wasm32-wasi -O2 -Iinclude -I../hardware --sysroot /home/asterick/wasi-libc/sysroot
LDFLAGS = --allow-undefined -lc --no-entry

.phony: all clean wast system0.h

all: $(TARGET)

clean:
	make -C ../system0 clean
	rm -Rf $(OBJECTS) $(TARGET) system0.h

wast: $(TARGET)
	wasm-dis $<

$(TARGET): $(OBJECTS)
	wasm-ld $(LDFLAGS) $(OBJECTS) -o $@
	../tools/strip.js $@

%.o: %.c include system0.h
	clang $(CFLAGS) $< -c -o $@

%.o: %.cc include system0.h
	clang -std=c++11 $(CFLAGS) $< -c -o $@

system0.h:
	make -C ../system0 all
	../tools/generate.js $(SYSTEM0) > $@
