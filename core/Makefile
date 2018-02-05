OBJECTS = core.o cop0.o base.o memory.o hash.o

CFLAGS = -emit-llvm --target=wasm32-O3 -Iinclude -ffreestanding

TARGET = "../assets/core.wasm"

.phony: all clean wast

all: $(TARGET)

clean:
	rm -Rf $(OBJECTS) $(TARGET)

wast: $(TARGET)
	wasm-dis $<

$(TARGET): $(OBJECTS)
	mkdir -p build
	llvm-link -o build/temp.bc $(OBJECTS)
	llc -asm-verbose=false -o build/temp.s build/temp.bc
	s2wasm build/temp.s > build/temp.wast
	wasm-as build/temp.wast -o $@

%.o: %.c include
	clang $(CFLAGS) $< -c -o $@

%.o: %.cc include
	clang $(CFLAGS) $< -c -o $@
