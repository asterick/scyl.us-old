#include "types.h"
#include "imports.h"

#define EXTERN

#include "cop0.h"

#include "registers.h"

static const int32_t CLOCK_BLOCK = 15000;       // Clock ticks per ms
static const int32_t MAX_CLOCK_LAG = 1500000;
typedef void (*exec_block)();

// *******
// ** Interface helpers
// *******

// This is a template function for executing
void execute_call(uint32_t start, uint32_t length) {
    while (registers.clocks > 0) {
        uint32_t index = ((registers.start_pc = registers.pc) - start) >> 2;
        if (index >= length) break ;
        ((exec_block)(index))();
    }
}

void finalize_call(uint32_t end) {
    registers.pc = end;
    registers.clocks -= (end - registers.start_pc) >> 2;
}

void reset() {
    registers.pc = 0xBFC00000;
    registers.clocks = 0;

    reset_cop0();
}

uint32_t getRegisterAddress() {
    return (uint32_t)&registers.regs[0];
}

uint32_t getStartPC() {
    return registers.start_pc;
}

void setStartPC(uint32_t address) {
    registers.start_pc = address;
}

uint32_t getPC() {
    return registers.pc;
}

void setPC(uint32_t address) {
    registers.pc = address;
}

uint32_t getHI() {
    return registers.hi;
}

uint32_t getLO() {
    return registers.lo;
}

void setClocks(int32_t time) {
    registers.clocks = time;
}

int32_t addClocks(int32_t time) {
    registers.clocks += time * CLOCK_BLOCK;
    if (registers.clocks > MAX_CLOCK_LAG) registers.clocks = MAX_CLOCK_LAG;

    return registers.clocks;
}

int32_t getClocks() {
    return registers.clocks;
}
