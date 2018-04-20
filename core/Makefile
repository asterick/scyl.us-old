OBJECTS = arm7/registers.o arm7/mmu.o arm7/base.o arm7/table.o dma/dma.o timer/timer.o gpu/gpu.o memory.o core.o 
TARGET = "../assets/core.wasm"
ROM = "../system0/code.bin"
SYSTEM0 =  ../system0/code.bin ../system0/data.bin

FIELDS = ../client/system/fields.js
TSV = ../tools/opcodes.tsv

CFLAGS = --target=wasm32-unknown-unknown-wasm --sysroot=$(WASMCEPTION)/sysroot -O2 -Iinclude -I../hardware
LDFLAGS = --allow-undefined -L $(WASMCEPTION)/sysroot/lib -lc

all: $(TARGET) $(FIELDS)

clean:
	make -C ../system0 clean
	rm -Rf $(OBJECTS) $(TARGET) system0.h arm7/op_table.h

wast: $(TARGET)
	wasm-dis $<

cstub: $(TSV)
	python2 ../tools/make_table.py $< --cstub ./arm7/base.cc

$(TARGET): arm7/op_table.h $(OBJECTS)
	$(WASMCEPTION)/dist/bin/wasm-ld $(LDFLAGS) $(OBJECTS) -o $@
	../tools/strip.js $@

%.o: %.c include system0.h
	$(WASMCEPTION)/dist/bin/clang $(CFLAGS) $< -c -o $@

%.o: %.cc include system0.h
	$(WASMCEPTION)/dist/bin/clang++ -std=c++11 $(CFLAGS) $< -c -o $@

arm7/op_table.h: $(TSV)
	python2 ../tools/make_table.py $< --table $@

$(FIELDS): $(TSV)
	python2 ../tools/make_table.py $< --jsfields $@

system0.h:
	make -C ../system0 all
	../tools/generate.js $(SYSTEM0) > $@

.phony: all clean wast cstub