BINARY = ../assets/system0.bin

OBJECTS = main.o startup.o
LD_SCRIPT = ./linker.x

ELFFILE = system0.elf
CODEROM = code.bin
DATAROM = data.bin

TOOLCHAIN = riscv64-unknown-linux-gnu

AS = $(TOOLCHAIN)-as
CC = $(TOOLCHAIN)-gcc
LD = $(TOOLCHAIN)-ld
OBJCOPY = $(TOOLCHAIN)-objcopy

TARGET = -march=rv32im -mabi=ilp32
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3 -nostdlib -I../hardware
LDFLAGS = -m elf32lriscv -T $(LD_SCRIPT)

all: $(CODEROM) $(DATAROM)

clean:
	rm -Rf  $(OBJECTS) $(CODEROM) $(DATAROM) $(BINARY) $(ELFFILE)

dump: $(ELFFILE)
	$(TOOLCHAIN)-objdump -x -s -d $(ELFFILE)

$(CODEROM): $(ELFFILE)
	$(OBJCOPY) -O binary -R ".data" $< $(CODEROM)

$(DATAROM): $(ELFFILE)
	$(OBJCOPY) -O binary -j ".data" $< $(DATAROM)

$(ELFFILE): $(OBJECTS) $(LD_SCRIPT)
	$(LD) $(LDFLAGS) -o $@ $(OBJECTS)

%.o: %.s
	$(AS) $(ASFLAGS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<
