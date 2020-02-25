#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "memory.h"

// ******
// ** Trap Instructions
// ******

EXPORT void ReservedInstruction(uint32_t address, uint32_t word) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address, 0);
}
