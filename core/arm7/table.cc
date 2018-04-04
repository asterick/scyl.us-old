#include <stdint.h>

#include "table.h"

#include "compiler.h"
#include "instructions.h"
#include "imports.h"

EXPORT void UndefinedOperation(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(UndefinedOperation);
#define UNKNOWN_OP INSTRUCTION(UndefinedOperation)

#include "op_table.h"

EXPORT InstructionCall locate(uint32_t iw) {
    const InstructionTable* table = &root_table;

    for (;;) {
        uint32_t index = (iw >> table->shift) & 0xF;
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
