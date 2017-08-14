OBJECTS = core.o cop0.o base.o memory.o
LLVM_ROOT = ~/llvmwasm/bin
BINARYEN_ROOT = ~/binaryen/bin
WABT_ROOT = ~/wabt
ROM_FILES = ../bin/code.bin ../bin/data.bin

CFLAGS = -O3

TARGET = "../bin/core.wasm"

all: $(TARGET)

clean:
	rm -Rf $(OBJECTS) $(TARGET)

wast: $(TARGET)
	$(WABT_ROOT)/wasm2wast $<


$(TARGET): $(OBJECTS)
	$(LLVM_ROOT)/llvm-link -o temp.bc $(OBJECTS)
	$(LLVM_ROOT)/llc -asm-verbose=false -o temp.s temp.bc
	$(BINARYEN_ROOT)/s2wasm temp.s > temp.wast
	python2 ./romdata.py temp.wast $(ROM_FILES)

	$(BINARYEN_ROOT)/wasm-as temp.wast -o $@
	rm -Rf temp.wast temp.s temp.bc

%.o: %.c
	$(LLVM_ROOT)/clang -emit-llvm --target=wasm32 $(CFLAGS) $< -c -o $@

%.o: %.cc
	$(LLVM_ROOT)/clang -emit-llvm --target=wasm32 $(CFLAGS) $< -c -o $@
