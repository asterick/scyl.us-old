OBJECTS = core.o cop0.o base.o memory.o hash.o standard.o
CFLAGS = --target=wasm32-unknown-unknown-wasm --sysroot=$(WASMCEPTION)/sysroot -O2 -Iinclude
TARGET = "../assets/core.wasm"
ROM = "../system0/code.bin"
SYSTEM0 =  ../system0/code.bin ../system0/data.bin

.phony: all clean wast

all: $(TARGET)

clean:
	rm -Rf $(OBJECTS) $(TARGET)

wast: $(TARGET)
	wasm-dis $<

$(TARGET): $(OBJECTS)
	$(WASMCEPTION)/dist/bin/wasm-ld --allow-undefined $(OBJECTS) -o $@

%.o: %.c include system0.h
	$(WASMCEPTION)/dist/bin/clang $(CFLAGS) $< -c -o $@

%.o: %.cc include system0.h
	$(WASMCEPTION)/dist/bin/clang++ -std=c++11 $(CFLAGS) $< -c -o $@

system0.h: $(SYSTEM0)
	python2 generate.py $(SYSTEM0) > $@
