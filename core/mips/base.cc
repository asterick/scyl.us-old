#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "memory.h"
#include "cop0.h"

// ******
// ** Load/Store instructions
// ******

EXPORT void LB(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = Memory::load(target, 0, address);

    write_reg(FIELD_RT(word), (int32_t)(data << (24 - (target & 3) * 8)) >> 24);
}

EXPORT void LBU(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = Memory::load(target, 0, address);

    write_reg(FIELD_RT(word), (data >> (target & 3) * 8) & 0xFF);
}

EXPORT void LH(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSLOAD, address, 0);
        return ;
    }

    uint32_t data = Memory::load(target, 0, address);

    write_reg(FIELD_RT(word), (int32_t)(data << (16 - (target & 2) * 8)) >> 16);
}

EXPORT void LHU(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSLOAD, address, 0);
        return ;
    }

    uint32_t data = Memory::load(target, 0, address);

    write_reg(FIELD_RT(word), (data >> (target & 2) * 8) & 0xFFFF);
}

EXPORT void LW(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) {
        exception(EXCEPTION_ADDRESSLOAD, address, 0);
        return ;
    }

    write_reg(FIELD_RT(word), Memory::load(target, 0, address));
}

EXPORT void SB(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    Memory::store(target, read_reg(FIELD_RT(word)) << shift, 0xFF << shift, address);
}

EXPORT void SH(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSSTORE, address, 0);
        return ;
    }

    int shift = (target & 3) * 8;

    Memory::store(target, read_reg(FIELD_RT(word)) << shift, 0xFFFF << shift, address);
}

EXPORT void SW(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) {
        exception(EXCEPTION_ADDRESSSTORE, address, 0);
        return ;
    }

    Memory::store(target, read_reg(FIELD_RT(word)), ~0, address);
}

EXPORT void LWR(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = Memory::load(target, 0, address);
    uint32_t rt = read_reg(FIELD_RT(word));

    int shift = (target & 3) * 8;
    uint32_t mask = ~0 >> shift;

    write_reg(FIELD_RT(word), ((data >> shift) & mask) | (rt & ~mask));
}

EXPORT void LWL(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) != 3) {
        uint32_t data = Memory::load(target, 0, address);
        uint32_t rt = read_reg(FIELD_RT(word));

        int shift = 24 - (target & 3) * 8;
        uint32_t mask = ~0 << shift;

        write_reg(FIELD_RT(word), ((data << shift) & mask) | (rt & ~mask));
    }
}

EXPORT void SWR(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    Memory::store(target, read_reg(FIELD_RT(word)) << shift, ~0 << shift, address);
}

EXPORT void SWL(uint32_t address, uint32_t word) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) != 3) {
        int shift = 24 - (target & 3) * 8;

        Memory::store(target, read_reg(FIELD_RT(word)) >> shift, ~0 >> shift, address);
    }
}

// ******
// ** Arithmatic instructions
// ******

// Cannot have significant bits in the uper portion of the 
static bool overflow(int64_t integer) {
    uint32_t top = (uint32_t)(integer >> 32);

    return top && ~top;
}

EXPORT void ADD(uint32_t address, uint32_t word) {
    int32_t rs = (int32_t)read_reg(FIELD_RS(word));
    int32_t rt = (int32_t)read_reg(FIELD_RT(word));
    int64_t temp = rs + rt;

    if (overflow(temp)) {
        exception(EXCEPTION_OVERFLOW, address, 0);
    }

    registers.regs[0]  = (uint32_t)temp;

    //write_reg(FIELD_RD(word), (uint32_t) temp);
}

EXPORT void ADDU(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) + read_reg(FIELD_RT(word)));
}

EXPORT void SUB(uint32_t address, uint32_t word) {
    int32_t rs = (int32_t)read_reg(FIELD_RS(word));
    int32_t rt = (int32_t)read_reg(FIELD_RT(word));
    int64_t temp = rs - rt;

    if (overflow(temp)) {
        exception(EXCEPTION_OVERFLOW, address, 0);
        return ;
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

EXPORT void SUBU(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) - read_reg(FIELD_RT(word)));
}

EXPORT void ADDI(uint32_t address, uint32_t word) {
    int32_t rs = (int32_t)read_reg(FIELD_RS(word));
    int64_t temp = rs + (int64_t)FIELD_SIMM16(word);

    if (overflow(temp)) {
        exception(EXCEPTION_OVERFLOW, address, 0);
        return ;
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

EXPORT void ADDIU(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) + FIELD_SIMM16(word));
}

// ******
// ** Comparison instructions
// ******

EXPORT void SLT(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RS(word)) < (int32_t)read_reg(FIELD_RT(word)));
}

EXPORT void SLTU(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) < read_reg(FIELD_RT(word)));
}

EXPORT void SLTI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), (int32_t)read_reg(FIELD_RS(word)) < FIELD_SIMM16(word));
}

EXPORT void SLTIU(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) < (uint32_t)FIELD_SIMM16(word));
}

// ******
// ** Logical instructions
// ******

EXPORT void AND(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) & read_reg(FIELD_RT(word)));
}

EXPORT void OR(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word)));
}

EXPORT void XOR(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) ^ read_reg(FIELD_RT(word)));
}

EXPORT void NOR(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), ~(read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word))));
}

EXPORT void ANDI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) & FIELD_IMM16(word));
}

EXPORT void ORI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) | FIELD_IMM16(word));
}

EXPORT void XORI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) ^ FIELD_IMM16(word));
}

// ******
// ** Shift instructions
// ******

EXPORT void SLLV(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << (read_reg(FIELD_RS(word)) & 0x1F));
}

EXPORT void SRLV(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

EXPORT void SRAV(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

EXPORT void SLL(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << FIELD_SHAMT(word));
}

EXPORT void SRL(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

EXPORT void SRA(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

EXPORT void LUI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RT(word), FIELD_IMM16(word) << 16);
}

// ******
// ** Multiply/Divide instructions
// ******

EXPORT void MULT(uint32_t address, uint32_t word) {
    registers.wide = (uint64_t)((int64_t)(int32_t)read_reg(FIELD_RS(word)) * (int64_t)(int32_t)read_reg(FIELD_RT(word)));
}

EXPORT void MULTU(uint32_t address, uint32_t word) {
    registers.wide = (uint64_t)read_reg(FIELD_RS(word)) * (uint64_t)read_reg(FIELD_RT(word));
}

EXPORT void DIV(uint32_t address, uint32_t word) {
    int32_t rt = read_reg(FIELD_RT(word));
    int32_t rs = read_reg(FIELD_RS(word));

    if (rt == 0) {
        registers.hi = rs;
        registers.lo = (rs < 0) ? 1 : -1;
    } else if (rs == -0x80000000 && rt == -1) {
        registers.hi = 0;
        registers.lo = -0x80000000;
    } else {
        registers.hi = (uint32_t)(rs % rt);
        registers.lo = (uint32_t)(rs / rt);
    }
}

EXPORT void DIVU(uint32_t address, uint32_t word) {
    uint32_t rt = read_reg(FIELD_RT(word));
    uint32_t rs = read_reg(FIELD_RS(word));

    if (rt) {
        registers.hi = rs % rt;
        registers.lo = rs / rt;
    } else {
        registers.hi = rs;
        registers.lo = (uint32_t)-1;
    }
}

EXPORT void MFHI(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), registers.hi);
}

EXPORT void MFLO(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), registers.lo);
}

EXPORT void MTHI(uint32_t address, uint32_t word) {
    registers.hi = read_reg(FIELD_RS(word));
}

EXPORT void MTLO(uint32_t address, uint32_t word) {
    registers.lo = read_reg(FIELD_RS(word));
}

// ******
// ** Branching instructions
// ******

EXPORT void J(uint32_t address, uint32_t word) {
    branch(address, (address & 0xF0000000) | (FIELD_IMM26(word) << 2));
}

EXPORT void JAL(uint32_t address, uint32_t word) {
    branch(address, (address & 0xF0000000) | (FIELD_IMM26(word) << 2));
    write_reg(REGS_RA, address + 8);
}

EXPORT void JR(uint32_t address, uint32_t word) {
    branch(address, read_reg(FIELD_RS(word)) & 0xFFFFFFFC);
}

EXPORT void JALR(uint32_t address, uint32_t word) {
    write_reg(FIELD_RD(word), address + 8);
    branch(address, read_reg(FIELD_RS(word)) & 0xFFFFFFFC);
}

EXPORT void BEQ(uint32_t address, uint32_t word) {
    if (read_reg(FIELD_RS(word)) == read_reg(FIELD_RT(word))) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BNE(uint32_t address, uint32_t word) {
    if (read_reg(FIELD_RS(word)) != read_reg(FIELD_RT(word))) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BLTZ(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BGEZ(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BGTZ(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BLEZ(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) <= 0) {
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BLTZAL(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) {
        write_reg(REGS_RA, address + 8);
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

EXPORT void BGEZAL(uint32_t address, uint32_t word) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) {
        write_reg(REGS_RA, address + 8);
        branch(address, FIELD_SIMM16(word) * 4 + address + 4);
    }
}

// ******
// ** Trap Instructions
// ******

EXPORT void ReservedInstruction(uint32_t address, uint32_t word) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address, 0);
}

EXPORT void CopUnusable(uint32_t address, uint32_t word) {
    exception(EXCEPTION_COPROCESSORUNUSABLE, address, FIELD_COP(word));
}

EXPORT void SYSCALL(uint32_t address, uint32_t word) {
    exception(EXCEPTION_SYSCALL, address, 0);
}

EXPORT void BREAK(uint32_t address, uint32_t word) {
    exception(EXCEPTION_BREAKPOINT, address, 0);
}
