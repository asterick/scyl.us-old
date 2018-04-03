OBJECTS = mips/cop0.o mips/base.o mips/table.o dma/dma.o timer/timer.o gpu/gpu.o memory.o core.o 
TARGET = "../assets/core.wasm"
ROM = "../system0/code.bin"
SYSTEM0 =  ../system0/code.bin ../system0/data.bin

CFLAGS = --target=wasm32-unknown-unknown-wasm --sysroot=$(WASMCEPTION)/sysroot -O2 -Iinclude -I../hardware
LDFLAGS = --allow-undefined -L $(WASMCEPTION)/sysroot/lib -lc

.phony: all clean wast system0.h

all: $(TARGET)

clean:
	make -C ../system0 clean
	rm -Rf $(OBJECTS) $(TARGET) system0.h

wast: $(TARGET)
	wasm-dis $<

$(TARGET): $(OBJECTS)
	$(WASMCEPTION)/dist/bin/wasm-ld $(LDFLAGS) $(OBJECTS) -o $@
	../tools/strip.js $@

%.o: %.c include system0.h
	$(WASMCEPTION)/dist/bin/clang $(CFLAGS) $< -c -o $@

%.o: %.cc include system0.h
	$(WASMCEPTION)/dist/bin/clang++ -std=c++11 $(CFLAGS) $< -c -o $@

system0.h:
	make -C ../system0 all
	../tools/generate.js $(SYSTEM0) > $@
