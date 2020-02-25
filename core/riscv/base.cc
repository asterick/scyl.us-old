#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "memory.h"

// *****
// ** Branch 
// *****

EXPORT void AUIPC(uint32_t address, uint32_t word) {

}

EXPORT void LUI(uint32_t address, uint32_t word) {

}

EXPORT void JAL(uint32_t address, uint32_t word) {
	write_reg(FIELD_RD(word), address + 4);
}

// ******
// ** Trap Instructions
// ******

EXPORT void ReservedInstruction(uint32_t address, uint32_t word) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address);
}
