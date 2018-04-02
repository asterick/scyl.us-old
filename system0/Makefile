BINARY = ../assets/system0.bin

OBJECTS = main.o startup.o
LD_SCRIPT = ./linker.x

ELFFILE = system0.elf
CODEROM = code.bin
DATAROM = data.bin

AS = arm-none-eabi-as
CC = arm-none-eabi-gcc
LD = arm-none-eabi-ld
OBJCOPY = arm-none-eabi-objcopy
OBJDUMP = arm-none-eabi-objdump

TARGET = -mcpu=arm7tdmi
ASFLAGS = $(TARGET)
CFLAGS = $(TARGET) -Wall -O3 -I../hardware
LDFLAGS = -T $(LD_SCRIPT) -nostartfiles

all: $(CODEROM) $(DATAROM)

clean:
	rm -Rf  $(OBJECTS) $(CODEROM) $(DATAROM) $(BINARY) $(ELFFILE)

dump: $(ELFFILE)
	$(OBJDUMP) -x -s -d $(ELFFILE)

$(CODEROM): $(ELFFILE)
	$(OBJCOPY) -O binary -R ".data" $< $(CODEROM)

$(DATAROM): $(ELFFILE)
	$(OBJCOPY) -O binary -j ".data" $< $(DATAROM)

$(ELFFILE): $(OBJECTS) $(LD_SCRIPT)
	$(CC) $(LDFLAGS) -o $@ $(OBJECTS)

%.o: %.s
	$(AS) -o $@ $<

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<
