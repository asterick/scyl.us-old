#define EXTERN

#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "table.h"

#include "cop0.h"
#include "memory.h"
#include "gpu.h"
#include "dma.h"

#include "registers.h"
#include "system.h"

struct SystemConfiguration {
    const Registers* registers;
};

static const int32_t MAX_CLOCK_LAG = 60000;
static uint32_t start_pc;

// *******
// ** Insertion point
// *******

EXPORT void reset() {
    registers.pc = RESET_VECTOR;
    registers.clocks = 0;

    COP0::reset();
}

EXPORT const SystemConfiguration* getConfiguration() {
    static const SystemConfiguration cfg = {
        &registers
    };

    return &cfg;
}

EXPORT void sync_state() {
    COP0::handle_interrupt();
    DMA::advance();
}

EXPORT void step_execute() {
    start_pc = registers.pc;
    registers.pc += 4;

    sync_state();
    execute(start_pc, false);
}

EXPORT void execute(uint32_t pc, bool delayed) {
    const uint32_t data = Memory::load(pc, true, pc, delayed);
    const InstructionCall call = locate(data);

    adjust_clock(1);
    call(pc, data, delayed);
}

// *******
// ** Interface helpers
// *******

extern "C" void _start() { }
typedef void (*instruction_index)();

EXPORT void execute_call(uint32_t start, uint32_t length) {
    if (registers.clocks > MAX_CLOCK_LAG) registers.clocks = MAX_CLOCK_LAG;

    start_pc = start;
    while (registers.clocks > 0) {
        const uint32_t index = ((start_pc = registers.pc) - start) >> 2;

        if (index >= length) return ;
        const instruction_index call = (instruction_index) index;
    }
}

EXPORT void adjust_clock(uint32_t cycles) {
    registers.clocks -= cycles;
}

EXPORT void calculate_clock(uint32_t end) {
    adjust_clock((end - start_pc) >> 2);    
}

EXPORT void finalize_call(uint32_t end) {
    registers.pc = end;
    adjust_clock((end - start_pc) >> 2);
}
