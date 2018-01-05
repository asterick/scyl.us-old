#include "types.h"
#include "imports.h"

#define EXTERN

#include "cop0.h"

#include "registers.h"

static const int32_t MAX_CLOCK_LAG = 60000;
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

void adjust_clock(uint32_t end) {
    registers.clocks -= (end - registers.start_pc) >> 2;
}

void reset() {
    registers.pc = 0xBFC00000;
    registers.clocks = 0;

    reset_cop0();
}

uint32_t getRegisterAddress() {
    return (uint32_t)&registers;
}
