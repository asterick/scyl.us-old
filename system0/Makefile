OUTPUT = ../bin/system0.rom
BINARY = system0.elf
OBJECTS = main.o startup.o
LD_SCRIPT = ./linker.x

AS = mipsel-unknown-elf-as
CC = mipsel-unknown-elf-gcc
LD = mipsel-unknown-elf-ld
OBJCOPY = mipsel-unknown-elf-objcopy

TARGET = -march=r3000 -EL -mhard-float
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3 -G0 -nostdlib -Wimplicit-function-declaration
LDFLAGS = -T $(LD_SCRIPT)

all: $(OUTPUT)

clean:
	rm -Rf  $(OBJECTS)

dump: $(OUTPUT)
	mipsel-unknown-elf-objdump -x -s -d $(BINARY)

$(OUTPUT): $(BINARY)
	$(OBJCOPY) -I elf32-littlemips -O binary -R ".data" $< $@
	$(OBJCOPY) -I elf32-littlemips -O binary -j ".data" $< data.bin
	cat data.bin >> $@

$(BINARY): $(OBJECTS) $(LD_SCRIPT)
	$(LD) $(LDFLAGS) -o $@ $(OBJECTS)

%.o: %.s
	$(AS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<
