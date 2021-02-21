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
This is the condensed ISA (currently undefined)
*/
static const InstructionTable C0_ISA = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable C1_ISA = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable C2_ISA = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

/*
This is the non-compressed ISA, trim the LSBs because they are pointless
*/
static const InstructionTable LOAD = {
    ENTRY_TABLE,
    FIELD_FUNCT3,
    {
        INSTRUCTION(LB),
        INSTRUCTION(LH),
        INSTRUCTION(LW),
        NO_ENTRY,
        INSTRUCTION(LBU),
        INSTRUCTION(LHU),
        NO_ENTRY,
        NO_ENTRY
    }
};

static const InstructionTable LOAD_FP = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable STORE = {
    ENTRY_TABLE,
    FIELD_FUNCT3,
    {
        INSTRUCTION(SB),
        INSTRUCTION(SH),
        INSTRUCTION(SW),
        NO_ENTRY,
        NO_ENTRY,
        NO_ENTRY,
        NO_ENTRY,
        NO_ENTRY
    }
};

static const InstructionTable STORE_FP = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable MISC_MEM = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable OPP_IMM = {
    ENTRY_TABLE,
    FIELD_FUNCT3,
    {
        INSTRUCTION(ADDI),
        NO_ENTRY,
        INSTRUCTION(SLTI),
        INSTRUCTION(SLTIU),
        INSTRUCTION(XORI),
        NO_ENTRY,
        INSTRUCTION(ORI),
        INSTRUCTION(ANDI),
    }
};

static const InstructionTable OPP_IMM_32 = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable AMO = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP_32 = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable MADD = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable MSUB = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable NMSUB = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable NMADD = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable OP_FP = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable BRANCH = {
    ENTRY_TABLE,
    FIELD_FUNCT3,
    {
        INSTRUCTION(BEQ),
        INSTRUCTION(BNE),
        NO_ENTRY,
        NO_ENTRY,
        INSTRUCTION(BLT),
        INSTRUCTION(BGE),
        INSTRUCTION(BLTU),
        INSTRUCTION(BGEU)
    }
};

static const InstructionTable OP_IMM_32 = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable JALR = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable SYSTEM = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        NO_ENTRY
    }
};

static const InstructionTable INSTRUCTIONS = {
    ENTRY_TABLE,
    FIELD_OPCODE,
    {
        &C0_ISA, &C1_ISA, &C2_ISA, &LOAD,              // 0x03
        &C0_ISA, &C1_ISA, &C2_ISA, &LOAD_FP,           // 0x07
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x0B
        &C0_ISA, &C1_ISA, &C2_ISA, &MISC_MEM,          // 0x0F
        &C0_ISA, &C1_ISA, &C2_ISA, &OPP_IMM,           // 0x13
        &C0_ISA, &C1_ISA, &C2_ISA, INSTRUCTION(AUIPC), // 0x17
        &C0_ISA, &C1_ISA, &C2_ISA, &OP_IMM_32,         // 0x1B
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x1F
        &C0_ISA, &C1_ISA, &C2_ISA, &STORE,             // 0x23
        &C0_ISA, &C1_ISA, &C2_ISA, &STORE_FP,          // 0x27
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x2B
        &C0_ISA, &C1_ISA, &C2_ISA, &AMO,               // 0x2F
        &C0_ISA, &C1_ISA, &C2_ISA, &OP,                // 0x33
        &C0_ISA, &C1_ISA, &C2_ISA, INSTRUCTION(LUI),   // 0x37
        &C0_ISA, &C1_ISA, &C2_ISA, &OP_32,             // 0x3B
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x3F
        &C0_ISA, &C1_ISA, &C2_ISA, &MADD,              // 0x43
        &C0_ISA, &C1_ISA, &C2_ISA, &MSUB,              // 0x47
        &C0_ISA, &C1_ISA, &C2_ISA, &NMSUB,             // 0x4B
        &C0_ISA, &C1_ISA, &C2_ISA, &NMADD,             // 0x4F
        &C0_ISA, &C1_ISA, &C2_ISA, &OP_FP,             // 0x53
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x57
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x5B
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x5F
        &C0_ISA, &C1_ISA, &C2_ISA, &BRANCH,            // 0x63
        &C0_ISA, &C1_ISA, &C2_ISA, &JALR,              // 0x67
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x6B
        &C0_ISA, &C1_ISA, &C2_ISA, INSTRUCTION(JAL),   // 0x6F
        &C0_ISA, &C1_ISA, &C2_ISA, &SYSTEM,            // 0x73
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x77
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY,           // 0x7B
        &C0_ISA, &C1_ISA, &C2_ISA, NO_ENTRY            // 0x7F
    }
};

EXPORT InstructionCall locate(uint32_t iw) {
    const InstructionTable* table = &INSTRUCTIONS;

    for (;;) {
        uint32_t index = table->extract(iw);
        table = (const InstructionTable*) table->entries[index];
        
        switch (table->type) {
            case ENTRY_TABLE: continue ;
            case ENTRY_INSTRUCTION: {
                const InstructionEntry* call = (const InstructionEntry*) table;        
                return call->funct;
            }
            default: return ReservedInstruction;
        }
    }
}
