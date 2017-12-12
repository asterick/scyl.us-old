#include "types.h"
#include "imports.h"

#define EXTERN

#include "cop0.h"

#include "registers.h"

static const int32_t CLOCK_BLOCK = 15000;   // Clock ticks per ms
typedef void (*exec_block)();

// *******
// ** Interface helpers
// *******

// This is a template function for executing
void execute_call(uint32_t start, uint32_t length) {
    while (clocks > 0) {
        uint32_t index = ((start_pc = pc) - start) >> 2;
        if (index >= length) break ;
        ((exec_block)(index))();
    }
}

void finalize_call(uint32_t end) {
    pc = end;
    clocks -= (end - start_pc) >> 2;
}

void reset() {
    pc = 0xBFC00000;
    clocks = 0;

    reset_cop0();
}

uint32_t getRegisterAddress() {
    return (uint32_t)&registers[0];
}

uint32_t getStartPC() {
    return start_pc;
}

void setStartPC(uint32_t address) {
    start_pc = address;
}

uint32_t getPC() {
    return pc;
}

void setPC(uint32_t address) {
    pc = address;
}

uint32_t getHI() {
    return mult.parts.hi;
}

uint32_t getLO() {
    return mult.parts.lo;
}

void setClocks(int32_t time) {
    clocks = time;
}

int32_t addClocks(int32_t time) {
    if (time > 100) time = 100;

    return clocks += time * CLOCK_BLOCK;
}

int32_t getClocks() {
    return clocks;
}
