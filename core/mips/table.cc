#include <stdint.h>

#include "compiler.h"
#include "instructions.h"
#include "imports.h"

#define	OPCODE_MASK     0b111111
#define	OPCODE_SHIFT    26
#define	FUNCT_MASK	    0b111111
#define	FUNCT_SHIFT	    0
#define	SHAMT_MASK	    0b11111
#define	SHAMT_SHIFT	    6
#define	RD_MASK	        0b11111
#define	RD_SHIFT	    11
#define	RT_MASK	        0b11111
#define	RT_SHIFT	    16
#define	RS_MASK	        0b11111
#define	RS_SHIFT	    21
#define	COP_MASK	    0b11
#define	COP_SHIFT	    26
#define	IMM16_MASK	    0
#define	IMM16_SHIFT	    0xffff
#define	SIMM16_MASK	    0
#define	SIMM16_SHIFT    0xffff
#define	IMM20_MASK	    0
#define	IMM20_SHIFT	    0xfffff
#define	IMM25_MASK	    0
#define	IMM25_SHIFT	    0x1ffffff
#define	IMM26_MASK	    0
#define	IMM26_SHIFT	    0x3ffffff

enum EntryType {
    ENTRY_TABLE,
    ENTRY_INSTRUCTION
};

typedef void (*InstructionCall)(uint32_t address, uint32_t word, uint32_t delayed);

struct InstructionTable {
    EntryType               type;
    int                     shift;
    int                     mask;
    const InstructionTable* entries[0x40];
};

struct InstructionEntry {
    EntryType       type;
    InstructionCall funct;
};

#define PREPARE_INSTRUCTION(call) static const InstructionEntry call ## _table = { ENTRY_INSTRUCTION, call };
#define INSTRUCTION(call) (const InstructionTable*) &(call ## _table)

PREPARE_INSTRUCTION(LB);
PREPARE_INSTRUCTION(LBU);
PREPARE_INSTRUCTION(LH);
PREPARE_INSTRUCTION(LHU);
PREPARE_INSTRUCTION(LW);
PREPARE_INSTRUCTION(SB);
PREPARE_INSTRUCTION(SH);
PREPARE_INSTRUCTION(SW);
PREPARE_INSTRUCTION(LWR);
PREPARE_INSTRUCTION(LWL);
PREPARE_INSTRUCTION(SWR);
PREPARE_INSTRUCTION(SWL);
PREPARE_INSTRUCTION(ADD);
PREPARE_INSTRUCTION(ADDU);
PREPARE_INSTRUCTION(SUB);
PREPARE_INSTRUCTION(SUBU);
PREPARE_INSTRUCTION(ADDI);
PREPARE_INSTRUCTION(ADDIU);
PREPARE_INSTRUCTION(SLT);
PREPARE_INSTRUCTION(SLTU);
PREPARE_INSTRUCTION(SLTI);
PREPARE_INSTRUCTION(SLTIU);
PREPARE_INSTRUCTION(AND);
PREPARE_INSTRUCTION(OR);
PREPARE_INSTRUCTION(XOR);
PREPARE_INSTRUCTION(NOR);
PREPARE_INSTRUCTION(ANDI);
PREPARE_INSTRUCTION(ORI);
PREPARE_INSTRUCTION(XORI);
PREPARE_INSTRUCTION(SLLV);
PREPARE_INSTRUCTION(SRLV);
PREPARE_INSTRUCTION(SRAV);
PREPARE_INSTRUCTION(SLL);
PREPARE_INSTRUCTION(SRL);
PREPARE_INSTRUCTION(SRA);
PREPARE_INSTRUCTION(LUI);
PREPARE_INSTRUCTION(MULT);
PREPARE_INSTRUCTION(MULTU);
PREPARE_INSTRUCTION(DIV);
PREPARE_INSTRUCTION(DIVU);
PREPARE_INSTRUCTION(MFHI);
PREPARE_INSTRUCTION(MFLO);
PREPARE_INSTRUCTION(MTHI);
PREPARE_INSTRUCTION(MTLO);
PREPARE_INSTRUCTION(J);
PREPARE_INSTRUCTION(JAL);
PREPARE_INSTRUCTION(JR);
PREPARE_INSTRUCTION(JALR);
PREPARE_INSTRUCTION(BEQ);
PREPARE_INSTRUCTION(BNE);
PREPARE_INSTRUCTION(BLTZ);
PREPARE_INSTRUCTION(BGEZ);
PREPARE_INSTRUCTION(BGTZ);
PREPARE_INSTRUCTION(BLEZ);
PREPARE_INSTRUCTION(BLTZAL);
PREPARE_INSTRUCTION(BGEZAL);
PREPARE_INSTRUCTION(ReservedInstruction);
PREPARE_INSTRUCTION(CopUnusable);
PREPARE_INSTRUCTION(SYSCALL);
PREPARE_INSTRUCTION(BREAK);
PREPARE_INSTRUCTION(RFE);
PREPARE_INSTRUCTION(MFC0);
PREPARE_INSTRUCTION(MTC0);
PREPARE_INSTRUCTION(CFC0);
PREPARE_INSTRUCTION(CTC0);
PREPARE_INSTRUCTION(LWC0);
PREPARE_INSTRUCTION(SWC0);

#define NO_ENTRY INSTRUCTION(ReservedInstruction)
#define COP_UNUSABLE INSTRUCTION(CopUnusable)

static const InstructionTable SPECIAL_TABLE = {
    ENTRY_TABLE,
    FUNCT_SHIFT, FUNCT_MASK,
    {
        INSTRUCTION(SLL),   // 0x00
        NO_ENTRY,           // 0x01
        INSTRUCTION(SRL),   // 0x02
        INSTRUCTION(SRA),   // 0x03
        INSTRUCTION(SLLV),  // 0x04
        NO_ENTRY,           // 0x05
        INSTRUCTION(SRLV),  // 0x06
        INSTRUCTION(SRAV),  // 0x07
        INSTRUCTION(JR),    // 0x08
        INSTRUCTION(JALR),  // 0x09
        NO_ENTRY,           // 0x0A
        NO_ENTRY,           // 0x0B
        INSTRUCTION(SYSCALL), // 0x0C
        INSTRUCTION(BREAK), // 0x0D
        NO_ENTRY,           // 0x0E
        NO_ENTRY,           // 0x0F
        INSTRUCTION(MFHI),  // 0x10
        INSTRUCTION(MTHI),  // 0x11
        INSTRUCTION(MFLO),  // 0x12
        INSTRUCTION(MTLO),  // 0x13
        NO_ENTRY,           // 0x14
        NO_ENTRY,           // 0x15
        NO_ENTRY,           // 0x16
        NO_ENTRY,           // 0x17
        INSTRUCTION(MULT),  // 0x18
        INSTRUCTION(MULTU), // 0x19
        INSTRUCTION(DIV),   // 0x1A
        INSTRUCTION(DIVU),  // 0x1B
        NO_ENTRY,           // 0x1C
        NO_ENTRY,           // 0x1D
        NO_ENTRY,           // 0x1E
        NO_ENTRY,           // 0x1F
        INSTRUCTION(ADD),   // 0x20
        INSTRUCTION(ADDU),  // 0x21
        INSTRUCTION(SUB),   // 0x22
        INSTRUCTION(SUBU),  // 0x23
        INSTRUCTION(AND),   // 0x24
        INSTRUCTION(OR),    // 0x25
        INSTRUCTION(XOR),   // 0x26
        INSTRUCTION(NOR),   // 0x27
        NO_ENTRY,           // 0x28
        NO_ENTRY,           // 0x29
        INSTRUCTION(SLT),   // 0x2A
        INSTRUCTION(SLTU),  // 0x2B
        NO_ENTRY,           // 0x2C
        NO_ENTRY,           // 0x2D
        NO_ENTRY,           // 0x2E
        NO_ENTRY,           // 0x2F
        NO_ENTRY,           // 0x30
        NO_ENTRY,           // 0x31
        NO_ENTRY,           // 0x32
        NO_ENTRY,           // 0x33
        NO_ENTRY,           // 0x34
        NO_ENTRY,           // 0x35
        NO_ENTRY,           // 0x36
        NO_ENTRY,           // 0x37
        NO_ENTRY,           // 0x38
        NO_ENTRY,           // 0x39
        NO_ENTRY,           // 0x3A
        NO_ENTRY,           // 0x3B
        NO_ENTRY,           // 0x3C
        NO_ENTRY,           // 0x3D
        NO_ENTRY,           // 0x3E
        NO_ENTRY,           // 0x3F
    }
};

static const InstructionTable BcondZ_TABLE = {
    ENTRY_TABLE,
    RT_SHIFT, RT_MASK,
    {
        INSTRUCTION(BLTZ),  // 0x00
        INSTRUCTION(BGEZ),  // 0x01
        NO_ENTRY,           // 0x02
        NO_ENTRY,           // 0x03
        NO_ENTRY,           // 0x04
        NO_ENTRY,           // 0x05
        NO_ENTRY,           // 0x06
        NO_ENTRY,           // 0x07
        NO_ENTRY,           // 0x08
        NO_ENTRY,           // 0x09
        NO_ENTRY,           // 0x0A
        NO_ENTRY,           // 0x0B
        NO_ENTRY,           // 0x0C
        NO_ENTRY,           // 0x0D
        NO_ENTRY,           // 0x0E
        NO_ENTRY,           // 0x0F
        INSTRUCTION(BLTZAL), // 0x10
        INSTRUCTION(BGEZAL), // 0x11
        NO_ENTRY,           // 0x12
        NO_ENTRY,           // 0x13
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
    }
};

static const InstructionTable COP0_SUB_TABLE = {
    ENTRY_TABLE,
    FUNCT_SHIFT, FUNCT_MASK,
    {
        NO_ENTRY,           // 0x00
        NO_ENTRY,           // 0x01
        NO_ENTRY,           // 0x02
        NO_ENTRY,           // 0x03
        NO_ENTRY,           // 0x04
        NO_ENTRY,           // 0x05
        NO_ENTRY,           // 0x06
        NO_ENTRY,           // 0x07
        NO_ENTRY,           // 0x08
        NO_ENTRY,           // 0x09
        NO_ENTRY,           // 0x0A
        NO_ENTRY,           // 0x0B
        NO_ENTRY,           // 0x0C
        NO_ENTRY,           // 0x0D
        NO_ENTRY,           // 0x0E
        NO_ENTRY,           // 0x0F
        INSTRUCTION(RFE),   // 0x10
        NO_ENTRY,           // 0x11
        NO_ENTRY,           // 0x12
        NO_ENTRY,           // 0x13
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
        NO_ENTRY,           // 0x20
        NO_ENTRY,           // 0x21
        NO_ENTRY,           // 0x22
        NO_ENTRY,           // 0x23
        NO_ENTRY,           // 0x24
        NO_ENTRY,           // 0x25
        NO_ENTRY,           // 0x26
        NO_ENTRY,           // 0x27
        NO_ENTRY,           // 0x28
        NO_ENTRY,           // 0x29
        NO_ENTRY,           // 0x2A
        NO_ENTRY,           // 0x2B
        NO_ENTRY,           // 0x2C
        NO_ENTRY,           // 0x2D
        NO_ENTRY,           // 0x2E
        NO_ENTRY,           // 0x2F
        NO_ENTRY,           // 0x30
        NO_ENTRY,           // 0x31
        NO_ENTRY,           // 0x32
        NO_ENTRY,           // 0x33
        NO_ENTRY,           // 0x34
        NO_ENTRY,           // 0x35
        NO_ENTRY,           // 0x36
        NO_ENTRY,           // 0x37
        NO_ENTRY,           // 0x38
        NO_ENTRY,           // 0x39
        NO_ENTRY,           // 0x3A
        NO_ENTRY,           // 0x3B
        NO_ENTRY,           // 0x3C
        NO_ENTRY,           // 0x3D
        NO_ENTRY,           // 0x3E
        NO_ENTRY,           // 0x3F
    }
};

static const InstructionTable COP0_TABLE = {
    ENTRY_TABLE,
    RS_SHIFT, RS_MASK,
    {
        INSTRUCTION(MFC0),  // 0x00
        NO_ENTRY,           // 0x01
        INSTRUCTION(CFC0),  // 0x02
        NO_ENTRY,           // 0x03
        INSTRUCTION(MTC0),  // 0x04
        NO_ENTRY,           // 0x05
        INSTRUCTION(CTC0),  // 0x06
        NO_ENTRY,           // 0x07
        NO_ENTRY,           // 0x08
        NO_ENTRY,           // 0x09
        NO_ENTRY,           // 0x0A
        NO_ENTRY,           // 0x0B
        NO_ENTRY,           // 0x0C
        NO_ENTRY,           // 0x0D
        NO_ENTRY,           // 0x0E
        NO_ENTRY,           // 0x0F
        &COP0_SUB_TABLE,    // 0x10
        NO_ENTRY,           // 0x11
        NO_ENTRY,           // 0x12
        NO_ENTRY,           // 0x13
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
    }
};

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
