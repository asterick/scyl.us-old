#pragma once

#include "compiler.h"

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

typedef void (*InstructionCall)(uint32_t address, uint32_t word);

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

EXPORT InstructionCall locate(uint32_t iw);
