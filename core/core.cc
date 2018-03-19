#define EXTERN

#include <stdint.h>

#include "compiler.h"
#include "imports.h"

#include "cop0.h"
#include "memory.h"

#include "registers.h"

struct SystemConfiguration {
    const MemoryRegion* memory_regions;
    const Registers* registers;
};

static const int32_t MAX_CLOCK_LAG = 60000;
static uint32_t start_pc;

typedef void (*exec_block)();

// *******
// ** Insertion point
// *******

EXPORT void reset() {
    registers.pc = 0xBFC00000;
    registers.clocks = 0;

    COP0::reset();
}

EXPORT const SystemConfiguration* getConfiguration() {
    static const SystemConfiguration cfg = {
        memory_regions,
        &registers
    };

    return &cfg;
}

// *******
// ** Interface helpers
// *******

// This is a template function for executing
EXPORT void execute_call(uint32_t start, uint32_t length) {
    while (registers.clocks > 0) {
        uint32_t index = ((start_pc = registers.pc) - start) >> 2;

        if (index >= length) return ;

        exec_block target = (exec_block) index;

        target();
    }
}

EXPORT void finalize_call(uint32_t end) {
    registers.pc = end;
    registers.clocks -= (end - start_pc) >> 2;
}

EXPORT void adjust_clock(uint32_t end) {
    registers.clocks -= (end - start_pc) >> 2;
}
