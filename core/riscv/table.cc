#include <stdint.h>

#include "table.h"

#include "compiler.h"
#include "instructions.h"
#include "imports.h"
#include "fields.h"

#define NO_ENTRY INSTRUCTION(ReservedInstruction)

PREPARE_INSTRUCTION(ReservedInstruction);

PREPARE_INSTRUCTION(LUI);
PREPARE_INSTRUCTION(JAL);
PREPARE_INSTRUCTION(AUIPC);


/*
This is the non-compressed ISA, trim the LSBs because they are pointless
*/
static const InstructionTable LOAD = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable LOAD_FP = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable STORE = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable STORE_FP = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable MISC_MEM = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OPP_IMM = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OPP_IMM_32 = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable AMO = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP_32 = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable MADD = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable MSUB = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable NMSUB = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable NMADD = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP_FP = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable BRANCH = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP_IMM_32 = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable JALR = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable SYSTEM = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable RV32I_ISA = {
    ENTRY_TABLE,
    (OPCODE_SHIFT + 2), (OPCODE_MASK >> 2),
    {
        &LOAD,              // 0x03
        &LOAD_FP,           // 0x07
        NO_ENTRY,           // 0x0B
        &MISC_MEM,          // 0x0F
        &OPP_IMM,           // 0x13
        INSTRUCTION(AUIPC), // 0x17
        &OP_IMM_32,         // 0x1B
        NO_ENTRY,           // 0x1F

        &STORE,             // 0x23
        &STORE_FP,          // 0x27
        NO_ENTRY,           // 0x2B
        &AMO,               // 0x2F
        &OP,                // 0x33
        INSTRUCTION(LUI),   // 0x37
        &OP_32,             // 0x3B
        NO_ENTRY,           // 0x3F

        &MADD,              // 0x43
        &MSUB,              // 0x47
        &NMSUB,             // 0x4B
        &NMADD,             // 0x4F
        &OP_FP,             // 0x53
        NO_ENTRY,           // 0x57
        NO_ENTRY,           // 0x5B
        NO_ENTRY,           // 0x5F

        &BRANCH,            // 0x63
        &JALR,              // 0x67
        NO_ENTRY,           // 0x6B
        INSTRUCTION(JAL),   // 0x6F
        &SYSTEM,            // 0x73
        NO_ENTRY,           // 0x77
        NO_ENTRY,           // 0x7B
        NO_ENTRY            // 0x7F
    }
};

/*
This is the condensed ISA (currently undefined)
*/
static const InstructionTable C0_ISA = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable C1_ISA = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable C2_ISA = {
    ENTRY_TABLE,
    0, 0,
    {
        NO_ENTRY
    }
};

static const InstructionTable INSTRUCTIONS = {
    ENTRY_TABLE,
    0, 0b111,
    {
        &C0_ISA, 
        &C1_ISA, 
        &C2_ISA,
        &RV32I_ISA
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
