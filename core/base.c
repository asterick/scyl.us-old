#include "types.h"

#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "helper.h"
#include "memory.h"

// ******
// ** Load/Store instructions
// ******

void LB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (int32_t)(data << (24 - (target & 3) * 8)) >> 24);
}

void LBU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (data >> (target & 3) * 8) & 0xFF);
}

void LH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);

    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (int32_t)(data << (16 - (target & 2) * 8)) >> 16);
}

void LHU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);

    uint32_t data = load(target, 0, address, delayed);

    write_reg(FIELD_RT(word), (data >> (target & 2) * 8) & 0xFFFF);
}

void LW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) exception(EXCEPTION_ADDRESSLOAD, address, delayed, 0);

    write_reg(FIELD_RT(word), load(target, 0, address, delayed));
}

void SB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, 0xFF << shift, address, delayed);
}

void SH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 1) exception(EXCEPTION_ADDRESSSTORE, address, delayed, 0);

    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, 0xFFFF << shift, address, delayed);
}

void SW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if (target & 3) exception(EXCEPTION_ADDRESSSTORE, address, delayed, 0);

    store(target, read_reg(FIELD_RT(word)), ~0, address, delayed);
}

void LWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    uint32_t data = load(target, 0, address, delayed);
    uint32_t rt = read_reg(FIELD_RT(word));

    int shift = (target & 3) * 8;
    uint32_t mask = ~0 >> shift;

    write_reg(FIELD_RT(word), ((data >> shift) & mask) | (rt & ~mask));
}

void LWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) == 3) return ;

    uint32_t data = load(target, 0, address, delayed);
    uint32_t rt = read_reg(FIELD_RT(word));

    int shift = 24 - (target & 3) * 8;
    uint32_t mask = ~0 << shift;

    write_reg(FIELD_RT(word), ((data << shift) & mask) | (rt & ~mask));
}

void SWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);
    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) << shift, ~0 << shift, address, delayed);
}

void SWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS(word)) + FIELD_IMM16(word);

    if ((target & 3) == 3) return ;

    int shift = 24 - (target & 3) * 8;

    store(target, read_reg(FIELD_RT(word)) >> shift, ~0 >> shift, address, delayed);
}

// ******
// ** Arithmatic instructions
// ******

void ADD(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS(word)) + (int64_t)(int32_t)read_reg(FIELD_RT(word));

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

void ADDU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) + read_reg(FIELD_RT(word)));
}

void SUB(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS(word)) - (int64_t)(int32_t)read_reg(FIELD_RT(word));

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

void SUBU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) - read_reg(FIELD_RT(word)));
}

void ADDI(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS(word)) + (int64_t)FIELD_SIMM16(word);

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD(word), (uint32_t) temp);
}

void ADDIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) + FIELD_SIMM16(word));
}

// ******
// ** Comparison instructions
// ******

void SLT(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RS(word)) < (int32_t)read_reg(FIELD_RT(word)));
}

void SLTU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) < read_reg(FIELD_RT(word)));
}

void SLTI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), (int32_t)read_reg(FIELD_RS(word)) < FIELD_SIMM16(word));
}

void SLTIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) < (uint32_t)FIELD_SIMM16(word));
}

// ******
// ** Logical instructions
// ******

void AND(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) & read_reg(FIELD_RT(word)));
}

void OR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word)));
}

void XOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RS(word)) ^ read_reg(FIELD_RT(word)));
}

void NOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), ~(read_reg(FIELD_RS(word)) | read_reg(FIELD_RT(word))));
}

void ANDI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) & FIELD_IMM16(word));
}

void ORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) | FIELD_IMM16(word));
}

void XORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), read_reg(FIELD_RS(word)) ^ FIELD_IMM16(word));
}

// ******
// ** Shift instructions
// ******

void SLLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << (read_reg(FIELD_RS(word)) & 0x1F));
}

void SRLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

void SRAV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> (read_reg(FIELD_RS(word)) & 0x1F));
}

void SLL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) << FIELD_SHAMT(word));
}

void SRL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

void SRA(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), (int32_t)read_reg(FIELD_RT(word)) >> FIELD_SHAMT(word));
}

void LUI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT(word), FIELD_IMM16(word) << 16);
}

// ******
// ** Multiply/Divide instructions
// ******

void MULT(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.wide = (uint64_t)((int64_t)(int32_t)read_reg(FIELD_RS(word)) * (int64_t)(int32_t)read_reg(FIELD_RT(word)));
}

void MULTU(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.wide = (uint64_t)read_reg(FIELD_RS(word)) * (uint64_t)read_reg(FIELD_RT(word));
}

void DIV(uint32_t address, uint32_t word, uint32_t delayed) {
    int32_t rt = read_reg(FIELD_RT(word));
    int32_t rs = read_reg(FIELD_RS(word));

    if (rt == 0) {
        mult.parts.hi = rs;
        mult.parts.lo = (rs < 0) ? 1 : -1;
    } else if (rs == -0x80000000 && rt == -1) {
        mult.parts.hi = 0;
        mult.parts.lo = -0x80000000;
    } else {
        mult.parts.hi = (uint32_t)(rs % rt);
        mult.parts.lo = (uint32_t)(rs / rt);
    }
}

void DIVU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t rt = read_reg(FIELD_RT(word));
    uint32_t rs = read_reg(FIELD_RS(word));

    if (rt) {
        mult.parts.hi = rs;
        mult.parts.lo = (uint32_t)-1;
    } else {
        mult.parts.hi = rs % rt;
        mult.parts.lo = rs / rt;
    }
}

void MFHI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), mult.parts.hi);
}

void MFLO(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), mult.parts.lo);
}

void MTHI(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.parts.hi = read_reg(FIELD_RS(word));
}

void MTLO(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.parts.lo = read_reg(FIELD_RS(word));
}

// ******
// ** Branching instructions
// ******

void J(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    execute(address + 4, 1);
}

void JAL(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    write_reg(REGS_RA, address + 8);
    execute(address + 4, 1);
}

void JR(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

void JALR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), address + 8);
    pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

void BEQ(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) != read_reg(FIELD_RT(word))) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BNE(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) == read_reg(FIELD_RT(word))) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) <= 0) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) return ;

    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLTZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) return ;

    write_reg(REGS_RA, address + 8);
    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGEZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) return ;

    write_reg(REGS_RA, address + 8);
    pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

// ******
// ** Trap Instructions
// ******

void ReservedInstruction(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address, delayed, 0);
}

void CopUnusable(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, FIELD_COP(word));
}

void SYSCALL(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_SYSCALL, address, delayed, 0);
}

void BREAK(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_BREAKPOINT, address, delayed, 0);
}
