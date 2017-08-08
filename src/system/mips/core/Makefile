SOURCE = core.c
LLVM_ROOT = ~/llvmwasm/bin
BINARYEN_ROOT = ~/binaryen/bin
WABT_ROOT = ~/wabt

CFLAGS = -O2

TARGET = "../../../../assets/core.wasm"

all: $(TARGET)

clean:
	rm -Rf $(OBJECTS) $(TARGET)

wast: $(TARGET)
	$(WABT_ROOT)/wasm2wast $<


$(TARGET): $(SOURCE)
	$(LLVM_ROOT)/clang -emit-llvm --target=wasm32 $(CFLAGS) $(SOURCE) -c -o temp.bl
	$(LLVM_ROOT)/llc -asm-verbose=false -o temp.s temp.bl
	$(BINARYEN_ROOT)/s2wasm temp.s > temp.wast
	$(WABT_ROOT)/wast2wasm temp.wast -o $@
	rm -Rf temp.wast temp.s temp.bl
