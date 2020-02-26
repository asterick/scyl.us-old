#include <stdint.h>

#include "compiler.h"
#include "imports.h"
#include "table.h"

#include "memory.h"
#include "gpu.h"
#include "dma.h"
#include "hart.h"

#include "registers.h"
#include "system.h"

struct SystemConfiguration {
    const Registers* registers;
};

static const int32_t MAX_CLOCK_LAG = 60000;
static uint32_t start_pc;
static int clock_adjust = 0;

// *******
// ** Insertion point
// *******

EXPORT void reset() {
    registers.pc = RESET_VECTOR;
    registers.clocks = 0;

    HART::reset();
}

EXPORT const SystemConfiguration* getConfiguration() {
    static const SystemConfiguration cfg = {
        &registers
    };

    return &cfg;
}

EXPORT void execute(uint32_t pc) {
    const uint32_t data = Memory::load(pc, true, pc);
    const InstructionCall call = locate(data);

    call(pc, data);
}

static void catch_up() {
    do {
        DMA::advance();
    } while (GPU::catchup(clock_adjust));

    //COP0::handle_interrupt();

    clock_adjust = 0;
}

EXPORT void step_execute() {
    start_pc = registers.pc;
    registers.pc += 4;

    catch_up();
    execute(start_pc);
}

EXPORT void block_execute(uint32_t start, uint32_t end) {
    typedef void (*instruction_index)();

    if (registers.clocks > MAX_CLOCK_LAG) registers.clocks = MAX_CLOCK_LAG;

    while (registers.clocks > 0) {
        start_pc = registers.pc;
        
        if (start_pc < start || start_pc >= end) return ;

        const uint32_t index = (start_pc - start) >> 2;
        const instruction_index call = (instruction_index) index;
        
        catch_up();
        call();
    }
}

void adjust_clock(uint32_t cycles) {
    clock_adjust += cycles;
    registers.clocks -= cycles;
}

EXPORT void branch(uint32_t pc, uint32_t end) {
    adjust_clock((pc - start_pc + 4) >> 2); 
    registers.pc = end;
}
