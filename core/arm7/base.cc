#include <stdint.h>
#include "compiler.h"

EXPORT void bx(uint32_t address, uint32_t word) {
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t cond = (word & 0xf0000000) >> 28;

}

EXPORT void blx(uint32_t address, uint32_t word) {
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t cond = (word & 0xf0000000) >> 28;

}

EXPORT void b(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t imm = (word & 0xffffff) >> 0;

}

EXPORT void bl(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t imm = (word & 0xffffff) >> 0;

}

EXPORT void stc(uint32_t address, uint32_t word) {
    const uint32_t cp_num = (word & 0xf00) >> 8;
    const uint32_t CRd = (word & 0xf000) >> 12;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t N = (word & 0x400000) >> 22;
    const uint32_t P = (word & 0x1000000) >> 24;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t W = (word & 0x200000) >> 21;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldc(uint32_t address, uint32_t word) {
    const uint32_t cp_num = (word & 0xf00) >> 8;
    const uint32_t CRd = (word & 0xf000) >> 12;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t N = (word & 0x400000) >> 22;
    const uint32_t P = (word & 0x1000000) >> 24;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t W = (word & 0x200000) >> 21;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void cdp(uint32_t address, uint32_t word) {
    const uint32_t cp_num = (word & 0xf00) >> 8;
    const uint32_t op1 = (word & 0xf00000) >> 20;
    const uint32_t op2 = (word & 0xe0) >> 5;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t CRd = (word & 0xf000) >> 12;
    const uint32_t CRn = (word & 0xf0000) >> 16;
    const uint32_t CRm = (word & 0xf) >> 0;

}

EXPORT void mcr(uint32_t address, uint32_t word) {
    const uint32_t cp_num = (word & 0xf00) >> 8;
    const uint32_t op1 = (word & 0xe00000) >> 21;
    const uint32_t op2 = (word & 0xe0) >> 5;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t CRn = (word & 0xf0000) >> 16;
    const uint32_t CRm = (word & 0xf) >> 0;

}

EXPORT void mrc(uint32_t address, uint32_t word) {
    const uint32_t cp_num = (word & 0xf00) >> 8;
    const uint32_t op1 = (word & 0xe00000) >> 21;
    const uint32_t op2 = (word & 0xe0) >> 5;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t CRn = (word & 0xf0000) >> 16;
    const uint32_t CRm = (word & 0xf) >> 0;

}

EXPORT void swi(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t imm = (word & 0xffffff) >> 0;

}

EXPORT void and_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void eor_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void sub_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void rsb_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void add_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void adc_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void sbc_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void rsc_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void tst_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t shift = (word & 0xf80) >> 7;

}

EXPORT void teq_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t shift = (word & 0xf80) >> 7;

}

EXPORT void cmp_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t shift = (word & 0xf80) >> 7;

}

EXPORT void cmn_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t shift = (word & 0xf80) >> 7;

}

EXPORT void orr_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void mov_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void bic_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void mvn_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void and_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void eor_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void sub_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void rsb_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void add_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void adc_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void sbc_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void rsc_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void tst_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t Rs = (word & 0xf00) >> 8;

}

EXPORT void teq_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t Rs = (word & 0xf00) >> 8;

}

EXPORT void cmp_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t Rs = (word & 0xf00) >> 8;

}

EXPORT void cmn_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;
    const uint32_t Rs = (word & 0xf00) >> 8;

}

EXPORT void orr_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void mov_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void bic_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void mvn_shift_reg(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void and_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void eor_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void sub_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void rsb_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void add_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void adc_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void sbc_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void rsc_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void tst_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void teq_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void cmp_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void cmn_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void orr_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void mov_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void bic_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void mvn_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;

}

EXPORT void swp(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;

}

EXPORT void swpb(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;

}

EXPORT void mul(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf0000) >> 16;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rs = (word & 0xf00) >> 8;

}

EXPORT void mla(uint32_t address, uint32_t word) {
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t Rd = (word & 0xf0000) >> 16;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf000) >> 12;

}

EXPORT void umull(uint32_t address, uint32_t word) {
    const uint32_t RdLo = (word & 0xf000) >> 12;
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t RdHi = (word & 0xf0000) >> 16;
    const uint32_t Rm = (word & 0xf) >> 0;

}

EXPORT void umlal(uint32_t address, uint32_t word) {
    const uint32_t RdLo = (word & 0xf000) >> 12;
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t RdHi = (word & 0xf0000) >> 16;
    const uint32_t Rm = (word & 0xf) >> 0;

}

EXPORT void smull(uint32_t address, uint32_t word) {
    const uint32_t RdLo = (word & 0xf000) >> 12;
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t RdHi = (word & 0xf0000) >> 16;
    const uint32_t Rm = (word & 0xf) >> 0;

}

EXPORT void smlal(uint32_t address, uint32_t word) {
    const uint32_t RdLo = (word & 0xf000) >> 12;
    const uint32_t Rs = (word & 0xf00) >> 8;
    const uint32_t S = (word & 0x100000) >> 20;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t RdHi = (word & 0xf0000) >> 16;
    const uint32_t Rm = (word & 0xf) >> 0;

}

EXPORT void mrs(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t S = (word & 0x400000) >> 22;
    const uint32_t cond = (word & 0xf0000000) >> 28;

}

EXPORT void msr_reg(uint32_t address, uint32_t word) {
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t S = (word & 0x400000) >> 22;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t field_mask = (word & 0xf0000) >> 16;

}

EXPORT void msr_rot_imm(uint32_t address, uint32_t word) {
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t S = (word & 0x400000) >> 22;
    const uint32_t rotate = (word & 0xf00) >> 8;
    const uint32_t imm = (word & 0xff) >> 0;
    const uint32_t field_mask = (word & 0xf0000) >> 16;

}

EXPORT void str_post_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void ldr_post_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void strt_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void ldrt_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void str_pre_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void ldr_pre_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void str_pre_wb_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void ldr_pre_wb_shift_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t shift = (word & 0xf80) >> 7;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t typ = (word & 0x60) >> 5;

}

EXPORT void str_post_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldr_post_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void strt_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrt_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void str_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldr_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void str_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldr_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t B = (word & 0x400000) >> 22;
    const uint32_t imm = (word & 0xfff) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void strh_post_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrh_post_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsb_post_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsh_post_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void strh_pre_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrh_pre_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsb_pre_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsh_pre_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void strh_pre_wb_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrh_pre_wb_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsb_pre_wb_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void ldrsh_pre_wb_reg(uint32_t address, uint32_t word) {
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t Rm = (word & 0xf) >> 0;
    const uint32_t Rn = (word & 0xf0000) >> 16;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;

}

EXPORT void strh_post_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrh_post_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsb_post_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsh_post_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void strh_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrh_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsb_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsh_pre_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void strh_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrh_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsb_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldrsh_pre_wb_imm(uint32_t address, uint32_t word) {
    const uint32_t immH = (word & 0xf00) >> 8;
    const uint32_t immL = (word & 0xf) >> 0;
    const uint32_t Rd = (word & 0xf000) >> 12;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void stm_reglist(uint32_t address, uint32_t word) {
    const uint32_t reg_list = (word & 0xffff) >> 0;
    const uint32_t P = (word & 0x1000000) >> 24;
    const uint32_t S = (word & 0x400000) >> 22;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t W = (word & 0x200000) >> 21;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

EXPORT void ldm_reglist(uint32_t address, uint32_t word) {
    const uint32_t reg_list = (word & 0xffff) >> 0;
    const uint32_t P = (word & 0x1000000) >> 24;
    const uint32_t S = (word & 0x400000) >> 22;
    const uint32_t U = (word & 0x800000) >> 23;
    const uint32_t W = (word & 0x200000) >> 21;
    const uint32_t cond = (word & 0xf0000000) >> 28;
    const uint32_t Rn = (word & 0xf0000) >> 16;

}

