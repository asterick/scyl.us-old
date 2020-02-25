#pragma once

extern "C" {
    // R3000 instructions
    void LB(uint32_t address, uint32_t word);
    void LBU(uint32_t address, uint32_t word);
    void LH(uint32_t address, uint32_t word);
    void LHU(uint32_t address, uint32_t word);
    void LW(uint32_t address, uint32_t word);
    void SB(uint32_t address, uint32_t word);
    void SH(uint32_t address, uint32_t word);
    void SW(uint32_t address, uint32_t word);
    void LWR(uint32_t address, uint32_t word);
    void LWL(uint32_t address, uint32_t word);
    void SWR(uint32_t address, uint32_t word);
    void SWL(uint32_t address, uint32_t word);
    void ADD(uint32_t address, uint32_t word);
    void ADDU(uint32_t address, uint32_t word);
    void SUB(uint32_t address, uint32_t word);
    void SUBU(uint32_t address, uint32_t word);
    void ADDI(uint32_t address, uint32_t word);
    void ADDIU(uint32_t address, uint32_t word);
    void SLT(uint32_t address, uint32_t word);
    void SLTU(uint32_t address, uint32_t word);
    void SLTI(uint32_t address, uint32_t word);
    void SLTIU(uint32_t address, uint32_t word);
    void AND(uint32_t address, uint32_t word);
    void OR(uint32_t address, uint32_t word);
    void XOR(uint32_t address, uint32_t word);
    void NOR(uint32_t address, uint32_t word);
    void ANDI(uint32_t address, uint32_t word);
    void ORI(uint32_t address, uint32_t word);
    void XORI(uint32_t address, uint32_t word);
    void SLLV(uint32_t address, uint32_t word);
    void SRLV(uint32_t address, uint32_t word);
    void SRAV(uint32_t address, uint32_t word);
    void SLL(uint32_t address, uint32_t word);
    void SRL(uint32_t address, uint32_t word);
    void SRA(uint32_t address, uint32_t word);
    void LUI(uint32_t address, uint32_t word);
    void MULT(uint32_t address, uint32_t word);
    void MULTU(uint32_t address, uint32_t word);
    void DIV(uint32_t address, uint32_t word);
    void DIVU(uint32_t address, uint32_t word);
    void MFHI(uint32_t address, uint32_t word);
    void MFLO(uint32_t address, uint32_t word);
    void MTHI(uint32_t address, uint32_t word);
    void MTLO(uint32_t address, uint32_t word);
    void J(uint32_t address, uint32_t word);
    void JAL(uint32_t address, uint32_t word);
    void JR(uint32_t address, uint32_t word);
    void JALR(uint32_t address, uint32_t word);
    void BEQ(uint32_t address, uint32_t word);
    void BNE(uint32_t address, uint32_t word);
    void BLTZ(uint32_t address, uint32_t word);
    void BGEZ(uint32_t address, uint32_t word);
    void BGTZ(uint32_t address, uint32_t word);
    void BLEZ(uint32_t address, uint32_t word);
    void BLTZAL(uint32_t address, uint32_t word);
    void BGEZAL(uint32_t address, uint32_t word);
    void ReservedInstruction(uint32_t address, uint32_t word);
    void CopUnusable(uint32_t address, uint32_t word);
    void SYSCALL(uint32_t address, uint32_t word);
    void BREAK(uint32_t address, uint32_t word);

    // COP0 Instructions
    void MFC0(uint32_t address, uint32_t word);
    void MTC0(uint32_t address, uint32_t word);
    void RFE(uint32_t address, uint32_t word);
    void CFC0(uint32_t address, uint32_t word);
    void CTC0(uint32_t address, uint32_t word);
    void LWC0(uint32_t address, uint32_t word);
    void SWC0(uint32_t address, uint32_t word);
}
