use exceptions::{throw, Exception};
use memory::{load, store};
use registers::REGISTERS;

// ******
// ** Load/Store instructions
// ******

pub fn lb(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let data = load(target, 0, address, delayed) as isize;

    write_reg! (rt! (word), data << (24 - (target & 3) * 8) >> 24);
}

pub fn lbu(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let data = load(target, 0, address, delayed);

    write_reg! (rt! (word), (data >> (target & 3) * 8) & 0xFF);
}

pub fn lh(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) != 0 {
        throw(Exception::ADDRESSLOAD, address, delayed, 0);
    }

    let data = load(target, 0, address, delayed) as isize;

    write_reg! (rt! (word), (data << (16 - (target & 2) * 8)) >> 16);
}

pub fn lhu(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) != 0 {
        throw(Exception::ADDRESSLOAD, address, delayed, 0);
    }

    let data = load(target, 0, address, delayed);

    write_reg! (rt! (word), (data >> (target & 2) * 8) & 0xFFFF);
}

pub fn lw(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) != 0 {
        throw(Exception::ADDRESSLOAD, address, delayed, 0);
    }

    write_reg! (rt! (word), load(target, 0, address, delayed));
}

pub fn sb(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, 0xFF << shift, address, delayed);
}

pub fn sh(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) != 0 {
        throw(Exception::ADDRESSSTORE, address, delayed, 0);
    }

    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, 0xFFFF << shift, address, delayed);
}

pub fn sw(address: usize, word: usize, delayed: usize) {
    let target: usize = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) != 0 {
        throw(Exception::ADDRESSSTORE, address, delayed, 0);
    }

    store(target, read_reg! (rt! (word)), !0, address, delayed);
}

pub fn lwr(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let data = load(target, 0, address, delayed);
    let rt = read_reg! (rt! (word));

    let shift = (target & 3) * 8;
    let mask = !0 >> shift;

    write_reg! (rt! (word), ((data >> shift) & mask) | (rt & !mask));
}

pub fn lwl(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) != 3 {
        let data = load(target, 0, address, delayed);
        let rt = read_reg! (rt! (word));

        let shift = 24 - (target & 3) * 8;
        let mask = !0 << shift;

        write_reg! (rt! (word), ((data << shift) & mask) | (rt & !mask));
    }
}

pub fn swr(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, !0 << shift, address, delayed);
}

pub fn swl(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) != 3 {
        let shift = 24 - (target & 3) * 8;
        store(target, read_reg! (rt! (word)) >> shift, !0 >> shift, address, delayed);
    }
}

// ******
// ** Arithmatic instructions
// ******

/*
void ADD(address: usize, uint32_t word, uint32_t delayed) {
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
    registers.wide = (uint64_t)((int64_t)(int32_t)read_reg(FIELD_RS(word)) * (int64_t)(int32_t)read_reg(FIELD_RT(word)));
}

void MULTU(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.wide = (uint64_t)read_reg(FIELD_RS(word)) * (uint64_t)read_reg(FIELD_RT(word));
}

void DIV(uint32_t address, uint32_t word, uint32_t delayed) {
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

void DIVU(uint32_t address, uint32_t word, uint32_t delayed) {
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

void MFHI(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), registers.hi);
}

void MFLO(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), registers.lo);
}

void MTHI(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.hi = read_reg(FIELD_RS(word));
}

void MTLO(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.lo = read_reg(FIELD_RS(word));
}

// ******
// ** Branching instructions
// ******

void J(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    execute(address + 4, 1);
}

void JAL(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = (address & 0xF0000000) | (FIELD_IMM26(word) << 2);
    write_reg(REGS_RA, address + 8);
    execute(address + 4, 1);
}

void JR(uint32_t address, uint32_t word, uint32_t delayed) {
    registers.pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

void JALR(uint32_t address, uint32_t word, uint32_t delayed) {
    write_reg(FIELD_RD(word), address + 8);
    registers.pc = read_reg(FIELD_RS(word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

void BEQ(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) != read_reg(FIELD_RT(word))) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BNE(uint32_t address, uint32_t word, uint32_t delayed) {
    if (read_reg(FIELD_RS(word)) == read_reg(FIELD_RT(word))) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGTZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) <= 0) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLEZ(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) > 0) return ;

    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BLTZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) >= 0) return ;

    write_reg(REGS_RA, address + 8);
    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}

void BGEZAL(uint32_t address, uint32_t word, uint32_t delayed) {
    if ((int32_t)read_reg(FIELD_RS(word)) < 0) return ;

    write_reg(REGS_RA, address + 8);
    registers.pc = FIELD_SIMM16(word) * 4 + address + 4;
    execute(address + 4, 1);
}
*/

// ******
// ** Trap Instructions
// ******

#[no_mangle]
pub fn reserved_instruction(address: usize, word: usize, delayed: usize) {
    throw(Exception::RESERVEDINSTRUCTION, address, delayed, 0);
}

#[no_mangle]
pub fn cop_unusable(address: usize, word: usize, delayed: usize) {
    throw(Exception::COPROCESSORUNUSABLE, address, delayed, cop! (word));
}

#[no_mangle]
pub fn syscall(address: usize, word: usize, delayed: usize) {
    throw(Exception::SYSCALL, address, delayed, 0);
}

#[no_mangle]
pub fn breakpoint(address: usize, word: usize, delayed: usize) {
    throw(Exception::BREAKPOINT, address, delayed, 0);
}
