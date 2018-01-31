use exceptions::{throw, Exception};
use memory::{load, store};
use registers::REGISTERS;

// ******
// ** Load/Store instructions
// ******

#[no_mangle]
pub fn lb(address: usize, word: usize, delayed: usize) {
    let target: usize = read_reg! (rs!(word)) + imm16!(word);
    let data: usize = load(target, 0, address, delayed);

    write_reg! (rt!(word), (data << (24 - (target & 3) * 8)) as isize >> 24);
}

#[no_mangle]
pub fn LBU(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let data = load(target, 0, address, delayed);

    write_reg! (rt! (word), (data >> (target & 3) * 8) & 0xFF);
}

#[no_mangle]
pub fn LH(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) { throw(Exception::ADDRESSLOAD, address, delayed, 0); }

    let data = load(target, 0, address, delayed);

    write_reg! (rt! (word), (int32_t)(data << (16 - (target & 2) * 8)) >> 16);
}

#[no_mangle]
pub fn LHU(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) { throw(Exception::ADDRESSLOAD, address, delayed, 0); }

    let data = load(target, 0, address, delayed);

    write_reg! (rt! (word), (data >> (target & 2) * 8) & 0xFFFF);
}

#[no_mangle]
pub fn LW(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) { throw(Exception::ADDRESSLOAD, address, delayed, 0); }

    write_reg! (rt! (word), load(target, 0, address, delayed));
}

#[no_mangle]
pub fn SB(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, 0xFF << shift, address, delayed);
}

#[no_mangle]
pub fn SH(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 1) { throw(Exception::ADDRESSSTORE, address, delayed, 0); }

    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, 0xFFFF << shift, address, delayed);
}

#[no_mangle]
pub fn SW(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if (target & 3) { throw(Exception::ADDRESSSTORE, address, delayed, 0); }

    store(target, read_reg! (rt! (word)), !0, address, delayed);
}

#[no_mangle]
pub fn LWR(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let data = load(target, 0, address, delayed);
    let rt = read_reg! (rt! (word));

    let shift = (target & 3) * 8;
    let mask = ~0 >> shift;

    write_reg! (rt! (word), ((data >> shift) & mask) | (rt & ~mask));
}

#[no_mangle]
pub fn LWL(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if ((target & 3) == 3) return ;

    let data = load(target, 0, address, delayed);
    let rt = read_reg! (rt! (word));

    let shift = 24 - (target & 3) * 8;
    let mask = ~0 << shift;

    write_reg! (rt! (word), ((data << shift) & mask) | (rt & ~mask));
}

#[no_mangle]
pub fn SWR(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);
    let shift = (target & 3) * 8;

    store(target, read_reg! (rt! (word)) << shift, ~0 << shift, address, delayed);
}

#[no_mangle]
pub fn SWL(address: usize, word: usize, delayed: usize) {
    let target = read_reg! (rs! (word)) + imm16! (word);

    if ((target & 3) == 3) return ;

    let shift = 24 - (target & 3) * 8;

    store(target, read_reg! (rt! (word)) >> shift, ~0 >> shift, address, delayed);
}

// ******
// ** Arithmatic instructions
// ******

#[no_mangle]
pub fn ADD(address: usize, word: usize, delayed: usize) {
    let rs = read_reg! (rs! (word)) as i32 as i64;
    let rt = read_reg! (rt! (word)) as i32 as i64;
    int64_t temp = rs + rt;

    if (temp < -0x80000000 || temp >= 0x80000000) {
        throw(Exception::OVERFLOW, address, delayed, 0);
    }

    write_reg! (rd! (word), temp as usize);
}

#[no_mangle]
pub fn ADDU(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) + read_reg! (rt! (word)));
}

#[no_mangle]
pub fn SUB(address: usize, word: usize, delayed: usize) {
    int64_t temp = (int64_t)(int32_t)read_reg! (rs! (word)) - (int64_t)(int32_t)read_reg! (rt! (word));

    if (temp < -0x80000000 || temp >= 0x80000000) {
        throw(Exception::OVERFLOW, address, delayed, 0);
    }

    write_reg! (rd! (word), (uint32_t) temp);
}

#[no_mangle]
pub fn SUBU(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) - read_reg! (rt! (word)));
}

#[no_mangle]
pub fn ADDI(address: usize, word: usize, delayed: usize) {
    int64_t temp = (int64_t)(int32_t)read_reg! (rs! (word)) + (int64_t)simm16! (word);

    if (temp < -0x80000000 || temp >= 0x80000000) {
        throw(Exception::OVERFLOW, address, delayed, 0);
    }

    write_reg! (rd! (word), (uint32_t) temp);
}

#[no_mangle]
pub fn ADDIU(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), read_reg! (rs! (word)) + simm16! (word));
}

// ******
// ** Comparison instructions
// ******

#[no_mangle]
pub fn SLT(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), (int32_t)read_reg! (rs! (word)) < (int32_t)read_reg! (rt! (word)));
}

#[no_mangle]
pub fn SLTU(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) < read_reg! (rt! (word)));
}

#[no_mangle]
pub fn SLTI(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), (int32_t)read_reg! (rs! (word)) < simm16! (word));
}

#[no_mangle]
pub fn SLTIU(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), read_reg! (rs! (word)) < (uint32_t)simm16! (word));
}

// ******
// ** Logical instructions
// ******

#[no_mangle]
pub fn AND(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) & read_reg! (rt! (word)));
}

#[no_mangle]
pub fn OR(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) | read_reg! (rt! (word)));
}

#[no_mangle]
pub fn XOR(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rs! (word)) ^ read_reg! (rt! (word)));
}

#[no_mangle]
pub fn NOR(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), ~(read_reg! (rs! (word)) | read_reg! (rt! (word))));
}

#[no_mangle]
pub fn ANDI(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), read_reg! (rs! (word)) & imm16! (word));
}

#[no_mangle]
pub fn ORI(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), read_reg! (rs! (word)) | imm16! (word));
}

#[no_mangle]
pub fn XORI(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), read_reg! (rs! (word)) ^ imm16! (word));
}

// ******
// ** Shift instructions
// ******

#[no_mangle]
pub fn SLLV(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rt! (word)) << (read_reg! (rs! (word)) & 0x1F));
}

#[no_mangle]
pub fn SRLV(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rt! (word)) >> (read_reg! (rs! (word)) & 0x1F));
}

#[no_mangle]
pub fn SRAV(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), (int32_t)read_reg! (rt! (word)) >> (read_reg! (rs! (word)) & 0x1F));
}

#[no_mangle]
pub fn SLL(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rt! (word)) << shamt! (word));
}

#[no_mangle]
pub fn SRL(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), read_reg! (rt! (word)) >> shamt! (word));
}

#[no_mangle]
pub fn SRA(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), (int32_t)read_reg! (rt! (word)) >> shamt! (word));
}

#[no_mangle]
pub fn LUI(address: usize, word: usize, delayed: usize) {
    write_reg! (rt! (word), imm16! (word) << 16);
}

// ******
// ** Multiply/Divide instructions
// ******

#[no_mangle]
pub fn MULT(address: usize, word: usize, delayed: usize) {
    registers.wide = (uint64_t)((int64_t)(int32_t)read_reg! (rs! (word)) * (int64_t)(int32_t)read_reg! (rt! (word)));
}

#[no_mangle]
pub fn MULTU(address: usize, word: usize, delayed: usize) {
    registers.wide = (uint64_t)read_reg! (rs! (word)) * (uint64_t)read_reg! (rt! (word));
}

#[no_mangle]
pub fn DIV(address: usize, word: usize, delayed: usize) {
    int32_t rt = read_reg! (rt! (word));
    int32_t rs = read_reg! (rs! (word));

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

#[no_mangle]
pub fn DIVU(address: usize, word: usize, delayed: usize) {
    let rt = read_reg! (rt! (word));
    let rs = read_reg! (rs! (word));

    if (rt) {
        registers.hi = rs;
        registers.lo = (uint32_t)-1;
    } else {
        registers.hi = rs % rt;
        registers.lo = rs / rt;
    }
}

#[no_mangle]
pub fn MFHI(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), registers.hi);
}

#[no_mangle]
pub fn MFLO(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), registers.lo);
}

#[no_mangle]
pub fn MTHI(address: usize, word: usize, delayed: usize) {
    registers.hi = read_reg! (rs! (word));
}

#[no_mangle]
pub fn MTLO(address: usize, word: usize, delayed: usize) {
    registers.lo = read_reg! (rs! (word));
}

// ******
// ** Branching instructions
// ******

#[no_mangle]
pub fn J(address: usize, word: usize, delayed: usize) {
    registers.pc = (address & 0xF0000000) | (imm26! (word) << 2);
    execute(address + 4, 1);
}

#[no_mangle]
pub fn JAL(address: usize, word: usize, delayed: usize) {
    registers.pc = (address & 0xF0000000) | (imm26! (word) << 2);
    write_reg! (REGS_RA, address + 8);
    execute(address + 4, 1);
}

#[no_mangle]
pub fn JR(address: usize, word: usize, delayed: usize) {
    registers.pc = read_reg! (rs! (word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn JALR(address: usize, word: usize, delayed: usize) {
    write_reg! (rd! (word), address + 8);
    registers.pc = read_reg! (rs! (word)) & 0xFFFFFFFC;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BEQ(address: usize, word: usize, delayed: usize) {
    if (read_reg! (rs! (word)) != read_reg! (rt! (word))) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BNE(address: usize, word: usize, delayed: usize) {
    if (read_reg! (rs! (word)) == read_reg! (rt! (word))) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BLTZ(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) >= 0) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BGEZ(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) > 0) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BGTZ(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) <= 0) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BLEZ(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) > 0) return ;

    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BLTZAL(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) >= 0) return ;

    write_reg! (REGS_RA, address + 8);
    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

#[no_mangle]
pub fn BGEZAL(address: usize, word: usize, delayed: usize) {
    if ((int32_t)read_reg! (rs! (word)) < 0) return ;

    write_reg! (REGS_RA, address + 8);
    registers.pc = simm16! (word) * 4 + address + 4;
    execute(address + 4, 1);
}

// ******
// ** Trap Instructions
// ******

#[no_mangle]
pub fn ReservedInstruction(address: usize, word: usize, delayed: usize) {
    throw(Exception::RESERVEDINSTRUCTION, address, delayed, 0);
}

#[no_mangle]
pub fn CopUnusable(address: usize, word: usize, delayed: usize) {
    throw(Exception::COPROCESSORUNUSABLE, address, delayed, cop! (word));
}

#[no_mangle]
pub fn SYSCALL(address: usize, word: usize, delayed: usize) {
    throw(Exception::SYSCALL, address, delayed, 0);
}

#[no_mangle]
pub fn BREAK(address: usize, word: usize, delayed: usize) {
    throw(Exception::BREAKPOINT, address, delayed, 0);
}
