#define EXTERN

#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "table.h"

#include "mmu.h"
#include "memory.h"
#include "gpu.h"
#include "dma.h"

#include "registers.h"
#include "system.h"

struct SystemConfiguration {
    const RegisterSet* registers;
};

static const int32_t MAX_CLOCK_LAG = 60000;
static uint32_t start_pc;
static uint32_t clocks;

// *******
// ** Insertion point
// *******

EXPORT void reset() {
    COP0::reset();
}

EXPORT const RegisterSet* getConfiguration() {
    return &regs_usr;   // TODO
}

EXPORT void sync_state() {
    COP0::handle_interrupt();
    DMA::advance();
}

EXPORT void step_execute() {
    start_pc = reg_pc;
    reg_pc += 4;

    sync_state();
    execute(start_pc);
}

EXPORT void execute(uint32_t pc) {
    const uint32_t data = Memory::load(pc, true, pc);
    const InstructionCall call = locate(data);

    adjust_clock(1);
    call(pc, data);
}

// *******
// ** Interface helpers
// *******

extern "C" void _start() { }

EXPORT void execute_call(uint32_t start, uint32_t length) {
    typedef void (*instruction_index)();

    if (clocks > MAX_CLOCK_LAG) clocks = MAX_CLOCK_LAG;

    while (clocks > 0) {
        start_pc = reg_pc;
        const uint32_t index = (start_pc - start) >> 2;

        if (index >= length) return ;
        const instruction_index call = (instruction_index) index;
        call();
    }
}

EXPORT void adjust_clock(int cycles) {
    clocks -= cycles;
}

EXPORT void calculate_clock(uint32_t end) {
    adjust_clock((end - start_pc) >> 2);    
}

EXPORT void finalize_call(uint32_t end) {
    reg_pc = end;
    adjust_clock((end - start_pc) >> 2);
}
