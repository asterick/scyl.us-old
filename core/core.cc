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

EXPORT void step_execute() {
    start_pc = registers.pc;
    registers.pc += 4;

    COP0::handle_interrupt();
    execute(start_pc, false);
}

EXPORT void execute(uint32_t pc, bool delayed) {
    const uint32_t data = Memory::load(pc, true, pc, delayed);
    const InstructionCall call = locate(data);

    call(pc, data, delayed);
}

// *******
// ** Interface helpers
// *******

EXPORT void block_execute(uint32_t start, uint32_t length) {
    typedef void (*instruction_index)();

    if (registers.clocks > MAX_CLOCK_LAG) registers.clocks = MAX_CLOCK_LAG;

    while (registers.clocks > 0) {
        start_pc = registers.pc;
        const uint32_t index = (start_pc - start) >> 2;

        if (index >= length) return ;
        const instruction_index call = (instruction_index) index;
        
        COP0::handle_interrupt();
        call();
    }
}

void adjust_clock(uint32_t cycles) {
    registers.clocks -= cycles;

    GPU::catchup(cycles);
    DMA::advance();
}

EXPORT void branch(uint32_t pc, uint32_t end) {
    // This eats a cycle for a branch delay slot
    adjust_clock((pc - start_pc + 8) >> 2); 
    registers.pc = end;
}
