OBJECTS = arm7/registers.o arm7/mmu.o arm7/base.o arm7/table.o dma/dma.o timer/timer.o gpu/gpu.o memory.o core.o 
TARGET = "../assets/core.wasm"
ROM = "../system0/code.bin"
SYSTEM0 =  ../system0/code.bin ../system0/data.bin

CFLAGS = --target=wasm32-unknown-unknown-wasm --sysroot=$(WASMCEPTION)/sysroot -O2 -Iinclude -I../hardware
LDFLAGS = --allow-undefined -L $(WASMCEPTION)/sysroot/lib -lc

.phony: all clean wast system0.h

all: $(TARGET)

clean:
	make -C ../system0 clean
	rm -Rf $(OBJECTS) $(TARGET) system0.h arm7/op_table.h

wast: $(TARGET)
	wasm-dis $<

$(TARGET): arm7/op_table.h $(OBJECTS)
	$(WASMCEPTION)/dist/bin/wasm-ld $(LDFLAGS) $(OBJECTS) -o $@
	../tools/strip.js $@

%.o: %.c include system0.h
	$(WASMCEPTION)/dist/bin/clang $(CFLAGS) $< -c -o $@

%.o: %.cc include system0.h
	$(WASMCEPTION)/dist/bin/clang++ -std=c++11 $(CFLAGS) $< -c -o $@

arm7/op_table.h: ../tools/opcodes.tsv
	python2 ../tools/make_table.py ../tools/opcodes.tsv --table $@

jsfields:
	python2 ../tools/make_table.py ../tools/opcodes.tsv --jsfields ../client/system/fields.js

cstub:
	python2 ../tools/make_table.py ../tools/opcodes.tsv --cstub ./arm7/base.cc

system0.h:
	make -C ../system0 all
	../tools/generate.js $(SYSTEM0) > $@
