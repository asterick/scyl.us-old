BINARY = ../assets/system0.bin

OBJECTS = main.o startup.o
LD_SCRIPT = ./linker.x

ELFFILE = system0.elf
CODEROM = code.bin
DATAROM = data.bin

AS = mipsel-unknown-elf-as
CC = mipsel-unknown-elf-gcc
LD = mipsel-unknown-elf-ld
OBJCOPY = mipsel-unknown-elf-objcopy

TARGET = -march=r3000 -EL -mhard-float
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3 -G0 -nostdlib -I../hardware
LDFLAGS = -T $(LD_SCRIPT)

all: $(CODEROM) $(DATAROM)

clean:
	rm -Rf  $(OBJECTS) $(CODEROM) $(DATAROM) $(BINARY) $(ELFFILE)

dump: $(ELFFILE)
	mipsel-unknown-elf-objdump -x -s -d $(ELFFILE)

$(CODEROM): $(ELFFILE)
	$(OBJCOPY) -I elf32-littlemips -O binary -R ".data" $< $(CODEROM)

$(DATAROM): $(ELFFILE)
	$(OBJCOPY) -I elf32-littlemips -O binary -j ".data" $< $(DATAROM)

$(ELFFILE): $(OBJECTS) $(LD_SCRIPT)
	$(LD) $(LDFLAGS) -o $@ $(OBJECTS)

%.o: %.s
	$(AS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<
