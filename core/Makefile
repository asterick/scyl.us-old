OBJECTS = core.o cop0.o base.o memory.o hash.o
LLVM_ROOT = ~/llvmwasm/bin
TEMP_FILES = temp.wast temp.s temp.bc

CFLAGS = -O3 -Iinclude -ffreestanding

TARGET = "../assets/core.wasm"

.phony: all clean wast

all: $(TARGET)

clean:
	rm -Rf $(OBJECTS) $(TARGET)

wast: $(TARGET)
	wasm-dis $<

$(TARGET): $(OBJECTS)
	$(LLVM_ROOT)/llvm-link -o temp.bc $(OBJECTS)
	$(LLVM_ROOT)/llc -asm-verbose=false -o temp.s temp.bc
	s2wasm temp.s > temp.wast
	wasm-as temp.wast -o $@
	rm -Rf $(TEMP_FILES)

%.o: %.c include
	clang -emit-llvm --target=wasm32 $(CFLAGS) $< -c -o $@

%.o: %.cc include
	clang -emit-llvm --target=wasm32 $(CFLAGS) $< -c -o $@
