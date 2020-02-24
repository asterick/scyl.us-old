BINARY = ../assets/system0.bin

OBJECTS = main.o startup.o
LD_SCRIPT = ./linker.x

ELFFILE = system0.elf
CODEROM = code.bin
DATAROM = data.bin

AS = riscv32-unknown-linux-gnu-as
CC = riscv32-unknown-linux-gnu-gcc
LD = riscv32-unknown-linux-gnu-ld
OBJCOPY = riscv32-unknown-linux-gnu-objcopy

TARGET = 
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3 -nostdlib -I../hardware
LDFLAGS = -T $(LD_SCRIPT)

all: $(CODEROM) $(DATAROM)

clean:
	rm -Rf  $(OBJECTS) $(CODEROM) $(DATAROM) $(BINARY) $(ELFFILE)

dump: $(ELFFILE)
	riscv32-unknown-linux-gnu-objdump -x -s -d $(ELFFILE)

$(CODEROM): $(ELFFILE)
	$(OBJCOPY) -O binary -R ".data" $< $(CODEROM)

$(DATAROM): $(ELFFILE)
	$(OBJCOPY) -O binary -j ".data" $< $(DATAROM)

$(ELFFILE): $(OBJECTS) $(LD_SCRIPT)
	$(LD) $(LDFLAGS) -o $@ $(OBJECTS)

%.o: %.s
	$(AS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<
