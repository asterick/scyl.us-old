#include "types.h"

#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "memory.h"
#include "cop0.h"

// ******
// ** Load/Store instructions
// ******

extern "C" void LB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (int32_t)(data << (24 - (target & 3) * 8)) >> 24);
}

extern "C" void LBU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (data >> (target & 3) * 8) & 0xFF);
}

extern "C" void LH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);
        return ;
    }

    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (int32_t)(data << (16 - (target & 2) * 8)) >> 16);
}

extern "C" void LHU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);
        return ;
    }

    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (data >> (target & 2) * 8) & 0xFFFF);
}

extern "C" void LW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) {
        exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);
        return ;
    }

    write_reg(FIELD_RT(word), load(target, 0, address, delayed));
}

extern "C" void SB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, 0xFF << shift, address, delayed);
}

extern "C" void SH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) {
        exception(EXCEPTION_ADDRESSSTORE, address, delayed, 0);
        return ;
    }

    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, 0xFFFF << shift, address, delayed);
}

extern "C" void SW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) {
        exception(EXCEPTION_ADDRESSSTORE, address, delayed, 0);
        return ;
    }

    store(target, read_reg(FIELD_RT(word)), ~0, address, delayed);
}

extern "C" void LWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);
    uint32_t rt = read_reg(FIELD_RT(word));

    int shift = (target & 3) * 8;
    uint32_t mask = ~0 >> shift;

    write_reg(FIELD_RT(word), ((data >> shift) & mask) | (rt & ~mask));
}

extern "C" void LWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) != 3) {
        uint32_t data = load(target, 0, address, delayed);
        uint32_t rt = read_reg(FIELD_RT(word));

        int shift = 24 - (target & 3) * 8;
        uint32_t mask = ~0 << shift;

        write_reg(FIELD_RT(word), ((data << shift) & mask) | (rt & ~mask));
    }
}

extern "C" void SWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, ~0 << shift, address, delayed);
}

extern "C" void SWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) != 3) {
        int shift = 24 - (target & 3) * 8;

        store(target, read_reg(FIELD_RT(word)) >> shift, ~0 >> shift, address, delayed);
    }
}

// ******
// ** Arithmatic instructions
// ******

static const int64_t MAX_LOW_I32 = -0x80000000L;
static const int64_t MAX_HIGH_I32 = 0x7FFFFFFFL;

extern "C" void ADD(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t rs = read_reg(FIELD_RS(word));
    uint32_t rt = read_reg(FIELD_RT(word));
    uint32_t temp = rs + rt;

    if ((temp < MAX_LOW_I32) || (temp > MAX_HIGH_I32)) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    registers.regs[0]  = (uint32_t)temp;

    //write_reg(FIELD_RD(word), (uint32_t) temp);
}

extern "C" void ADDU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) + read_reg(FIELD_RT(word)));
}

extern "C" void SUB(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t rs = (int64_t)(int32_t)read_reg(FIELD_RS(word));
    int64_t rt = (int64_t)(int32_t)read_reg(FIELD_RT(word));
    int64_t temp = rs - rt;

    if ((temp < MAX_LOW_I32) || (temp > MAX_HIGH_I32)) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
        return ;
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

extern "C" void SUBU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) - read_reg(FIELD_RT(word)));
}

extern "C" void ADDI(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS(word)) + (int64_t)FIELD_SIMM16(word);

    if ((temp < MAX_LOW_I32) || (temp > MAX_HIGH_I32)) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
        return ;
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

extern "C" void ADDIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) + FIELD_SIMM16(word));
}

// ******
// ** Comparison instructions
// ******

extern "C" void SLT(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RS(word)) < (int32_t)read_reg(FIELD_RT(word)));
}

extern "C" void SLTU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) < read_reg(FIELD_RT(word)));
}

extern "C" void SLTI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), (int32_t)read_reg(FIELD_RS(word)) < FIELD_SIMM16(word));
}

extern "C" void SLTIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) < (uint32_t)FIELD_SIMM16(word));
}

// ******
// ** Logical instructions
// ******

extern "C" void AND(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) & read_reg(FIELD_RT(word)));
}

extern "C" void OR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word)));
}

extern "C" void XOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) ^ read_reg(FIELD_RT(word)));
}

extern "C" void NOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), ~(read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word))));
}

extern "C" void ANDI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) & FIELD_IMM16(word));
}

extern "C" void ORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) | FIELD_IMM16(word));
}

extern "C" void XORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) ^ FIELD_IMM16(word));
}

// ******
// ** Shift instructions
// ******

extern "C" void SLLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << (read_reg(FIELD_RS(word)) & 0x1F));
}

extern "C" void SRLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

extern "C" void SRAV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

extern "C" void SLL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << FIELD_SHAMT(word));
}

extern "C" void SRL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

extern "C" void SRA(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

extern "C" void LUI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), FIELD_IMM16(word) << 16);
}

// ******
// ** Multiply/Divide instructions
// ******

extern "C" void MULT(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.wide = (uint64_t)((int64_t)(int32_t)read_reg(FIELD_RS(word)) * (int64_t)(int32_t)read_reg(FIELD_RT(word)));
}

extern "C" void MULTU(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.wide = (uint64_t)read_reg(FIELD_RS(word)) * (uint64_t)read_reg(FIELD_RT(word));
}

extern "C" void DIV(uint32_t address, uint32_t word, uint32_t delayed) {
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

extern "C" void DIVU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t rt = read_reg(FIELD_RT(word));
    uint32_t rs = read_reg(FIELD_RS(word));

    if (rt) {
        registers.hi = rs;
        registers.lo = (uint32_t)-1;
    } else {
        registers.hi = rs % rt;
        registers.lo = rs / rt;
    }
}

extern "C" void MFHI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), registers.hi);
}

extern "C" void MFLO(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), registers.lo);
}

extern "C" void MTHI(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.hi = read_reg(FIELD_RS(word));
}

extern "C" void MTLO(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.lo = read_reg(FIELD_RS(word));
}

// ******
// ** Branching instructions
// ******

extern "C" void J(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    execute(address + 4, 1);
}

extern "C" void JAL(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    write_reg(REGS_RA, address + 8);
    execute(address + 4, 1);
}

extern "C" void JR(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

extern "C" void JALR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), address + 8);
    registers.pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

extern "C" void BEQ(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) == read_reg(FIELD_RT(word))) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BNE(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) != read_reg(FIELD_RT(word))) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BLTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BGEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BGTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BLEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) <= 0) {
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BLTZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) {
        write_reg(REGS_RA, address + 8);
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

extern "C" void BGEZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) {
        write_reg(REGS_RA, address + 8);
        registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
        execute(address + 4, 1);
    }
}

// ******
// ** Trap Instructions
// ******

extern "C" void ReservedInstruction(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address, delayed, 0);
}

extern "C" void CopUnusable(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, FIELD_COP(word));
}

extern "C" void SYSCALL(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_SYSCALL, address, delayed, 0);
}

extern "C" void BREAK(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_BREAKPOINT, address, delayed, 0);
}
