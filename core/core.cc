#define EXTERN

#include <stdint.h>

#include "compiler.h"
#include "imports.h"

#include "cop0.h"
#include "memory.h"
#include "gpu.h"
#include "dma.h"

#include "registers.h"

struct SystemConfiguration {
    const Registers* registers;
};

static const int32_t MAX_CLOCK_LAG = 60000;
static uint32_t start_pc;

// *******
// ** Insertion point
// *******

EXPORT void reset() {
    registers.pc = 0xBFC00000;
    registers.clocks = 0;

    COP0::reset();
    GPU::reset();
}

EXPORT const SystemConfiguration* getConfiguration() {
    static const SystemConfiguration cfg = {
        &registers
    };

    return &cfg;
}

EXPORT void sync_state() {
    handle_interrupt();
    DMA::advance();
}

// *******
// ** Interface helpers
// *******

extern "C" void _start() { }
extern "C" void call_indirect(int index);

EXPORT void execute_call(uint32_t start, uint32_t length) {
    start_pc = start;
    while (registers.clocks > 0) {
        uint32_t index = ((start_pc = registers.pc) - start) >> 2;

        if (index >= length) return ;

        call_indirect(index);
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
