#include "types.h"
#include "imports.h"

#define EXTERN

#include "registers.h"
#include "helper.h"

uint32_t start_pc;
uint32_t clocks;

// *******
// ** Interface helpers
// *******

void reset() {
    pc = 0xBFC00000;
    clocks = 0;
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

int32_t getClocks() {
    return clocks;
}
