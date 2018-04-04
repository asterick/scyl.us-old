#pragma once

#include "compiler.h"

enum EntryType {
    ENTRY_TABLE,
    ENTRY_INSTRUCTION
};

typedef void (*InstructionCall)(uint32_t address, uint32_t word);

struct InstructionTable {
    EntryType               type;
    int                     shift;
    const InstructionTable* entries[0x10];
};

struct InstructionEntry {
    EntryType       type;
    InstructionCall funct;
};

#define PREPARE_INSTRUCTION(call) static const InstructionEntry call ## _table = { ENTRY_INSTRUCTION, call };
#define INSTRUCTION(call) (const InstructionTable*) &(call ## _table)

EXPORT InstructionCall locate(uint32_t iw);
