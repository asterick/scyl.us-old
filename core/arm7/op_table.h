EXPORT void b_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(b_imm);
EXPORT void stc(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(stc);
EXPORT void ldc(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldc);
EXPORT void cdp(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cdp);
EXPORT void mcr(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mcr);
EXPORT void mrc(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mrc);
EXPORT void swi_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(swi_imm);
EXPORT void and_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(and_shift_imm);
EXPORT void eor_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(eor_shift_imm);
EXPORT void sub_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sub_shift_imm);
EXPORT void rsb_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsb_shift_imm);
EXPORT void add_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(add_shift_imm);
EXPORT void adc_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(adc_shift_imm);
EXPORT void sbc_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sbc_shift_imm);
EXPORT void rsc_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsc_shift_imm);
EXPORT void tst_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(tst_shift_imm);
EXPORT void teq_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(teq_shift_imm);
EXPORT void cmp_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmp_shift_imm);
EXPORT void cmn_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmn_shift_imm);
EXPORT void orr_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(orr_shift_imm);
EXPORT void mov_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mov_shift_imm);
EXPORT void bic_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(bic_shift_imm);
EXPORT void mvn_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mvn_shift_imm);
EXPORT void and_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(and_shift_reg);
EXPORT void eor_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(eor_shift_reg);
EXPORT void sub_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sub_shift_reg);
EXPORT void rsb_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsb_shift_reg);
EXPORT void add_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(add_shift_reg);
EXPORT void adc_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(adc_shift_reg);
EXPORT void sbc_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sbc_shift_reg);
EXPORT void rsc_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsc_shift_reg);
EXPORT void tst_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(tst_shift_reg);
EXPORT void teq_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(teq_shift_reg);
EXPORT void cmp_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmp_shift_reg);
EXPORT void cmn_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmn_shift_reg);
EXPORT void orr_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(orr_shift_reg);
EXPORT void mov_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mov_shift_reg);
EXPORT void bic_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(bic_shift_reg);
EXPORT void mvn_shift_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mvn_shift_reg);
EXPORT void and_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(and_rot_imm);
EXPORT void eor_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(eor_rot_imm);
EXPORT void sub_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sub_rot_imm);
EXPORT void rsb_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsb_rot_imm);
EXPORT void add_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(add_rot_imm);
EXPORT void adc_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(adc_rot_imm);
EXPORT void sbc_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(sbc_rot_imm);
EXPORT void rsc_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(rsc_rot_imm);
EXPORT void tst_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(tst_rot_imm);
EXPORT void teq_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(teq_rot_imm);
EXPORT void cmp_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmp_rot_imm);
EXPORT void cmn_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cmn_rot_imm);
EXPORT void orr_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(orr_rot_imm);
EXPORT void mov_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mov_rot_imm);
EXPORT void bic_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(bic_rot_imm);
EXPORT void mvn_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mvn_rot_imm);
EXPORT void swp(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(swp);
EXPORT void cswp(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(cswp);
EXPORT void mul(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mul);
EXPORT void mla(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mla);
EXPORT void umull(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(umull);
EXPORT void umlal(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(umlal);
EXPORT void smull(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(smull);
EXPORT void smlal(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(smlal);
EXPORT void mrs(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(mrs);
EXPORT void msr_reg(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(msr_reg);
EXPORT void msr_rot_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(msr_rot_imm);
EXPORT void str_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(str_shift_imm);
EXPORT void ldr_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldr_shift_imm);
EXPORT void strb_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strb_shift_imm);
EXPORT void ldrb_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrb_shift_imm);
EXPORT void strt_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strt_shift_imm);
EXPORT void ldrt_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrt_shift_imm);
EXPORT void strbt_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strbt_shift_imm);
EXPORT void ldrbt_shift_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrbt_shift_imm);
EXPORT void strh(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strh);
EXPORT void ldrh(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrh);
EXPORT void ldrsb(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrsb);
EXPORT void ldrsh(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrsh);
EXPORT void str_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(str_imm);
EXPORT void ldr_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldr_imm);
EXPORT void strb_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strb_imm);
EXPORT void ldrb_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrb_imm);
EXPORT void strt_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strt_imm);
EXPORT void ldrt_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrt_imm);
EXPORT void strbt_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(strbt_imm);
EXPORT void ldrbt_imm(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldrbt_imm);
EXPORT void stm_reglist(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(stm_reglist);
EXPORT void ldm_reglist(uint32_t address, uint32_t word);
PREPARE_INSTRUCTION(ldm_reglist);
static const InstructionTable sub_tree_2 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(and_shift_imm),
        INSTRUCTION(and_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mul),
        UNKNOWN_OP,
        INSTRUCTION(strh),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_3 = {
    ENTRY_TABLE, 3, {
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(ldrh),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(ldrsb),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(ldrsh),
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_4 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(eor_shift_imm),
        INSTRUCTION(eor_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mla),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_5 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(sub_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(sub_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_6 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(rsb_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(rsb_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_7 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(add_shift_imm),
        INSTRUCTION(add_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(umull),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_8 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(adc_shift_imm),
        INSTRUCTION(adc_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(umlal),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_9 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(sbc_shift_imm),
        INSTRUCTION(sbc_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(smull),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_10 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(rsc_shift_imm),
        INSTRUCTION(rsc_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(smlal),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_1 = {
    ENTRY_TABLE, 20, {
        &sub_tree_2,
        &sub_tree_3,
        &sub_tree_4,
        UNKNOWN_OP,
        &sub_tree_5,
        UNKNOWN_OP,
        &sub_tree_6,
        UNKNOWN_OP,
        &sub_tree_7,
        UNKNOWN_OP,
        &sub_tree_8,
        UNKNOWN_OP,
        &sub_tree_9,
        UNKNOWN_OP,
        &sub_tree_10,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_12 = {
    ENTRY_TABLE, 4, {
        INSTRUCTION(mrs),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(swp),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_13 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(tst_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(tst_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_14 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(teq_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(teq_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_15 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(cmp_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(cmp_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_16 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(cmn_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(cmn_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_17 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(orr_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(orr_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_18 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(mov_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mov_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_19 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(bic_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(bic_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_20 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(mvn_shift_imm),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mvn_shift_reg),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_11 = {
    ENTRY_TABLE, 20, {
        &sub_tree_12,
        &sub_tree_13,
        INSTRUCTION(msr_reg),
        &sub_tree_14,
        INSTRUCTION(cswp),
        &sub_tree_15,
        UNKNOWN_OP,
        &sub_tree_16,
        &sub_tree_17,
        UNKNOWN_OP,
        &sub_tree_18,
        UNKNOWN_OP,
        &sub_tree_19,
        UNKNOWN_OP,
        &sub_tree_20,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_21 = {
    ENTRY_TABLE, 20, {
        INSTRUCTION(and_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(eor_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(sub_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(rsb_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(add_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(adc_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(sbc_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(rsc_rot_imm),
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_22 = {
    ENTRY_TABLE, 20, {
        UNKNOWN_OP,
        INSTRUCTION(tst_rot_imm),
        INSTRUCTION(msr_rot_imm),
        INSTRUCTION(teq_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(cmp_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(cmn_rot_imm),
        INSTRUCTION(orr_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(mov_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(bic_rot_imm),
        UNKNOWN_OP,
        INSTRUCTION(mvn_rot_imm),
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_23 = {
    ENTRY_TABLE, 19, {
        INSTRUCTION(str_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldr_imm),
        UNKNOWN_OP,
        INSTRUCTION(strt_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrt_imm),
        UNKNOWN_OP,
        INSTRUCTION(strb_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrb_imm),
        UNKNOWN_OP,
        INSTRUCTION(strbt_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrbt_imm),
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_24 = {
    ENTRY_TABLE, 19, {
        INSTRUCTION(str_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldr_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(strt_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrt_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(strb_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrb_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(strbt_shift_imm),
        UNKNOWN_OP,
        INSTRUCTION(ldrbt_shift_imm),
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_25 = {
    ENTRY_TABLE, 17, {
        INSTRUCTION(stm_reglist),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(ldm_reglist),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_26 = {
    ENTRY_TABLE, 17, {
        INSTRUCTION(stc),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(ldc),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_28 = {
    ENTRY_TABLE, 1, {
        INSTRUCTION(cdp),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mcr),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable sub_tree_27 = {
    ENTRY_TABLE, 17, {
        &sub_tree_28,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        INSTRUCTION(mrc),
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
        UNKNOWN_OP,
    }
};

static const InstructionTable root_table = {
    ENTRY_TABLE, 24, {
        &sub_tree_1,
        &sub_tree_11,
        &sub_tree_21,
        &sub_tree_22,
        &sub_tree_23,
        UNKNOWN_OP,
        &sub_tree_24,
        UNKNOWN_OP,
        &sub_tree_25,
        UNKNOWN_OP,
        INSTRUCTION(b_imm),
        UNKNOWN_OP,
        &sub_tree_26,
        UNKNOWN_OP,
        &sub_tree_27,
        INSTRUCTION(swi_imm),
    }
};

