OUTPUT = ../bin/system0.rom
BINARY = system0.elf
OBJECTS = main.o startup.o

AS = mipsel-unknown-elf-as
CC = mipsel-unknown-elf-gcc
LD = mipsel-unknown-elf-ld
OBJCOPY = mipsel-unknown-elf-objcopy

TARGET = -mips1 -EL
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3
LDFLAGS = -T ./linker.x

all: $(OUTPUT)

clean:
	rm -Rf  $(OBJECTS)

dump: $(BINARY)
	mipsel-unknown-elf-objdump -x -d $<

$(OUTPUT): $(BINARY)
	$(OBJCOPY) -I elf32-littlemips -O binary $< $@

$(BINARY): $(OBJECTS)
	$(LD) $(LDFLAGS) -o $@ $<

%.o: %.s
	$(AS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $< 
