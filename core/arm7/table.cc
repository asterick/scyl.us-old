#include <stdint.h>

#include "table.h"

#include "compiler.h"
#include "instructions.h"
#include "imports.h"

#define NO_ENTRY INSTRUCTION(ReservedInstruction)

static const InstructionTable INSTRUCTIONS = {
    ENTRY_TABLE,
    OPCODE_SHIFT, OPCODE_MASK,
    {
        &SPECIAL_TABLE,     // 0x00
        &BcondZ_TABLE,      // 0x01
        INSTRUCTION(J),     // 0x02
        INSTRUCTION(JAL),   // 0x03
        INSTRUCTION(BEQ),   // 0x04
        INSTRUCTION(BNE),   // 0x05
        INSTRUCTION(BLEZ),  // 0x06
        INSTRUCTION(BGTZ),  // 0x07
        INSTRUCTION(ADDI),  // 0x08
        INSTRUCTION(ADDIU), // 0x09
        INSTRUCTION(SLTI),  // 0x0A
        INSTRUCTION(SLTIU), // 0x0B
        INSTRUCTION(ANDI),  // 0x0C
        INSTRUCTION(ORI),   // 0x0D
        INSTRUCTION(XORI),  // 0x0E
        INSTRUCTION(LUI),   // 0x0F
        &COP0_TABLE,        // 0x10
        COP_UNUSABLE,       // 0x11
        COP_UNUSABLE,       // 0x12
        COP_UNUSABLE,       // 0x13
        NO_ENTRY,           // 0x14
        NO_ENTRY,           // 0x15
        NO_ENTRY,           // 0x16
        NO_ENTRY,           // 0x17
        NO_ENTRY,           // 0x18
        NO_ENTRY,           // 0x19
        NO_ENTRY,           // 0x1A
        NO_ENTRY,           // 0x1B
        NO_ENTRY,           // 0x1C
        NO_ENTRY,           // 0x1D
        NO_ENTRY,           // 0x1E
        NO_ENTRY,           // 0x1F
        INSTRUCTION(LB),    // 0x20
        INSTRUCTION(LH),    // 0x21
        INSTRUCTION(LWL),   // 0x22
        INSTRUCTION(LW),    // 0x23
        INSTRUCTION(LBU),   // 0x24
        INSTRUCTION(LHU),   // 0x25
        INSTRUCTION(LWR),   // 0x26
        NO_ENTRY,           // 0x27
        INSTRUCTION(SB),    // 0x28
        INSTRUCTION(SH),    // 0x29
        INSTRUCTION(SWL),   // 0x2A
        INSTRUCTION(SW),    // 0x2B
        NO_ENTRY,           // 0x2C
        NO_ENTRY,           // 0x2D
        INSTRUCTION(SWR),   // 0x2E
        NO_ENTRY,           // 0x2F
        INSTRUCTION(LWC0),  // 0x30
        COP_UNUSABLE,       // 0x31
        COP_UNUSABLE,       // 0x32
        COP_UNUSABLE,       // 0x33
        NO_ENTRY,           // 0x34
        NO_ENTRY,           // 0x35
        NO_ENTRY,           // 0x36
        NO_ENTRY,           // 0x37
        INSTRUCTION(SWC0),  // 0x38
        COP_UNUSABLE,       // 0x39
        COP_UNUSABLE,       // 0x3A
        COP_UNUSABLE,       // 0x3B
        NO_ENTRY,           // 0x3C
        NO_ENTRY,           // 0x3D
        NO_ENTRY,           // 0x3E
        NO_ENTRY            // 0x3F
    }
};

EXPORT InstructionCall locate(uint32_t iw) {
    const InstructionTable* table = &INSTRUCTIONS;

    for (;;) {
        uint32_t index = (iw >> table->shift) & table->mask;
        table = (const InstructionTable*) table->entries[index];
        
        switch (table->type) {
            case ENTRY_TABLE: continue ;
            case ENTRY_INSTRUCTION: {
                const InstructionEntry* call = (const InstructionEntry*) table;        
                return call->funct;
            }
            default: return (InstructionCall) -1;
        }
    }
}
