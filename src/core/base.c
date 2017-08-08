#include "types.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

uint32_t registers[32];
uint32_t pc;

union {
    struct {
        uint32_t lo;
        uint32_t hi;
    } parts;
    uint64_t wide;
} mult;

uint32_t ram[1024*1024];	// 4MB of RAM
uint32_t rom[128*1024];		// 512kB of ROM

// These are the functions that get inlined
__attribute__((noinline))
uint32_t read_reg(reg) {
	return reg ? registers[reg] : 0;
}

__attribute__((noinline))
void write_reg(reg, value) {
	if (reg) registers[reg] = value;
}

// ******
// ** Load/Store instructions
// ******

void LB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;
    uint32_t data = load(target, pc, delayed);

    write_reg(FIELD_RT, (int32_t)(data << (24 - (target & 3) * 8)) >> 24);
}

void LBU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;
    uint32_t data = load(target, pc, delayed);

    write_reg(FIELD_RT, (data >> (target & 3) * 8) & 0xFF);
}

void LH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if (target & 1) exception(EXCEPTION_ADDRESSLOAD, pc, delayed, 0);

    uint32_t data = load(target, pc, delayed);

    write_reg(FIELD_RT, (int32_t)(data << (16 - (target & 2) * 8)) >> 16);
}

void LHU(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if (target & 1) exception(EXCEPTION_ADDRESSLOAD, pc, delayed, 0);

    uint32_t data = load(target, pc, delayed);

    write_reg(FIELD_RT, (data >> (target & 2) * 8) & 0xFFFF);
}

void LW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if (target & 3) exception(EXCEPTION_ADDRESSLOAD, pc, delayed, 0);

    write_reg(FIELD_RT, load(target, pc, delayed));
}

void SB(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;
    int shift = (target & 3) * 8;

    store(target, word << shift, 0xFF << shift, pc, delayed);
}

void SH(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if (target & 1) exception(EXCEPTION_ADDRESSSTORE, pc, delayed, 0);

    int shift = (target & 3) * 8;

    store(target, word << shift, 0xFFFF << shift, pc, delayed);
}

void SW(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if (target & 3) exception(EXCEPTION_ADDRESSSTORE, pc, delayed, 0);

    store(target, word, ~0, pc, delayed);
}

void LWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;
    int shift = (target & 3) * 3;

    uint32_t rt = read_reg(FIELD_RT);
    uint32_t data = load(target, pc, delayed);

    write_reg(FIELD_RT, (data >> shift) | (rt & (~0 << shift)));
}

void LWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if ((target & 3) == 3) return ;

    uint32_t data = load(target, pc, delayed);
    int shift = ((target & 3) + 1) * 8;

    write_reg(FIELD_RT, (data >> (32 - shift)) | ((~0 >> shift) & read_reg(FIELD_RT)));
}

void SWR(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;
    int shift = (target & 3) * 8;

    store(target, read_reg(FIELD_RT) << shift, -1 << shift, pc, delayed);
}

void SWL(uint32_t address, uint32_t word, uint32_t delayed) {
    uint32_t target = read_reg(FIELD_RS) + FIELD_IMM16;

    if ((target & 3) == 3) return ;

    int shift = 32 - ((target & 3) + 1) * 8;

    store(target, read_reg(FIELD_RT) >> shift, -1 << shift, pc, delayed);
}

// ******
// ** Arithmatic instructions
// ******

void ADD(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS) + (int64_t)(int32_t)read_reg(FIELD_RT);

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD, (uint32_t) temp);
}

void ADDU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RS) + read_reg(FIELD_RT));
}

void SUB(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS) - (int64_t)(int32_t)read_reg(FIELD_RT);

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD, (uint32_t) temp);
}

void SUBU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RS) - read_reg(FIELD_RT));
}

void ADDI(uint32_t address, uint32_t word, uint32_t delayed) {
    int64_t temp = (int64_t)(int32_t)read_reg(FIELD_RS) + (int64_t)FIELD_SIMM16;

    if (temp < -0x80000000 || temp >= 0x80000000) {
        exception(EXCEPTION_OVERFLOW, address, delayed, 0);
    }

    write_reg(FIELD_RD, (uint32_t) temp);
}

void ADDIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) + FIELD_SIMM16);
}

// ******
// ** Comparison instructions
// ******

void SLT(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, (int32_t)read_reg(FIELD_RS) < (int32_t)read_reg(FIELD_RT));
}

void SLTU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RS) < read_reg(FIELD_RT));
}

void SLTI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, (int32_t)read_reg(FIELD_RS) < FIELD_SIMM16);
}

void SLTIU(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RS) < (uint32_t)FIELD_SIMM16);
}

// ******
// ** Logical instructions
// ******

void AND(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) & read_reg(FIELD_RT));
}

void OR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) | read_reg(FIELD_RT));
}

void XOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) ^ read_reg(FIELD_RT));
}

void NOR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, ~(read_reg(FIELD_RS) | read_reg(FIELD_RT)));
}

void ANDI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) & FIELD_IMM16);
}

void ORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) | FIELD_IMM16);
}

void XORI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, read_reg(FIELD_RS) ^ FIELD_IMM16);
}

// ******
// ** Shift instructions
// ******

void SLLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RT) << (read_reg(FIELD_RS) & 0x1F));
}

void SRLV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RT) >> (read_reg(FIELD_RS) & 0x1F));
}

void SRAV(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, (int32_t)read_reg(FIELD_RT) >> (read_reg(FIELD_RS) & 0x1F));
}

void SLL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RT) << FIELD_SHAMT);
}

void SRL(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, read_reg(FIELD_RT) >> FIELD_SHAMT);
}

void SRA(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, (int32_t)read_reg(FIELD_RT) >> FIELD_SHAMT);
}

void LUI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RT, FIELD_IMM16 << 16);
}

// ******
// ** Multiply/Divide instructions
// ******

void MULT(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.wide = (uint64_t)((int64_t)(int32_t)read_reg(FIELD_RS) * (int64_t)(int32_t)read_reg(FIELD_RT));
}

void MULTU(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.wide = (uint64_t)read_reg(FIELD_RS) * (uint64_t)read_reg(FIELD_RT);
}

void DIV(uint32_t address, uint32_t word, uint32_t delayed) {
    int32_t rt = read_reg(FIELD_RT);
    int32_t rs = read_reg(FIELD_RS);

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
    uint32_t rt = read_reg(FIELD_RT);
    uint32_t rs = read_reg(FIELD_RS);

    if (rt) {
        mult.parts.hi = rs;
        mult.parts.lo = (uint32_t)-1;
    } else {
        mult.parts.hi = rs % rt;
        mult.parts.lo = rs / rt;
    }
}

void MFHI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, mult.parts.hi);
}

void MFLO(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, mult.parts.lo);
}

void MTHI(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.parts.hi = read_reg(FIELD_RS);
}

void MTLO(uint32_t address, uint32_t word, uint32_t delayed) {
    mult.parts.lo = read_reg(FIELD_RS);
}

// ******
// ** Branching instructions
// ******

void J(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = (address & 0xF0000000) | (FIELD_IMM26 << 2);
    delay(address + 4);
}

void JAL(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = (address & 0xF0000000) | (FIELD_IMM26 << 2);
    write_reg(REGS_RA, address + 8);
    pc = read_reg(FIELD_RS) & 0xFFFFFFFC;
    delay(address + 4);
}

void JR(uint32_t address, uint32_t word, uint32_t delayed) {
    pc = read_reg(FIELD_RS) & 0xFFFFFFFC;
    delay(address + 4);
}

void JALR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD, address + 8);
    pc = read_reg(FIELD_RS) & 0xFFFFFFFC;
    delay(address + 4);
}

void BEQ(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS) != read_reg(FIELD_RT)) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BNE(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS) == read_reg(FIELD_RT)) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BLTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) >= 0) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BGEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) > 0) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BGTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) <= 0) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BLEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) > 0) return ;

    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BLTZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) >= 0) return ;

    write_reg(REGS_RA, address + 8);
    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

void BGEZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS) < 0) return ;

    write_reg(REGS_RA, address + 8);
    pc = FIELD_SIMM16 * 4 + address + 4;
    delay(address + 4);
}

// ******
// ** Trap Instructions
// ******

void ReservedInstruction(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_RESERVEDINSTRUCTION, address, delayed, 0);
}

void CopUnusable(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, FIELD_COP);
}

void SYSCALL(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_SYSCALL, address, delayed, 0);
}

void BREAK(uint32_t address, uint32_t word, uint32_t delayed) {
    exception(EXCEPTION_BREAKPOINT, address, delayed, 0);
}
