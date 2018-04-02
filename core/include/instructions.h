#pragma once

extern "C" {
    // R3000 instructions
    void LB(uint32_t address, uint32_t word, uint32_t delayed);
    void LBU(uint32_t address, uint32_t word, uint32_t delayed);
    void LH(uint32_t address, uint32_t word, uint32_t delayed);
    void LHU(uint32_t address, uint32_t word, uint32_t delayed);
    void LW(uint32_t address, uint32_t word, uint32_t delayed);
    void SB(uint32_t address, uint32_t word, uint32_t delayed);
    void SH(uint32_t address, uint32_t word, uint32_t delayed);
    void SW(uint32_t address, uint32_t word, uint32_t delayed);
    void LWR(uint32_t address, uint32_t word, uint32_t delayed);
    void LWL(uint32_t address, uint32_t word, uint32_t delayed);
    void SWR(uint32_t address, uint32_t word, uint32_t delayed);
    void SWL(uint32_t address, uint32_t word, uint32_t delayed);
    void ADD(uint32_t address, uint32_t word, uint32_t delayed);
    void ADDU(uint32_t address, uint32_t word, uint32_t delayed);
    void SUB(uint32_t address, uint32_t word, uint32_t delayed);
    void SUBU(uint32_t address, uint32_t word, uint32_t delayed);
    void ADDI(uint32_t address, uint32_t word, uint32_t delayed);
    void ADDIU(uint32_t address, uint32_t word, uint32_t delayed);
    void SLT(uint32_t address, uint32_t word, uint32_t delayed);
    void SLTU(uint32_t address, uint32_t word, uint32_t delayed);
    void SLTI(uint32_t address, uint32_t word, uint32_t delayed);
    void SLTIU(uint32_t address, uint32_t word, uint32_t delayed);
    void AND(uint32_t address, uint32_t word, uint32_t delayed);
    void OR(uint32_t address, uint32_t word, uint32_t delayed);
    void XOR(uint32_t address, uint32_t word, uint32_t delayed);
    void NOR(uint32_t address, uint32_t word, uint32_t delayed);
    void ANDI(uint32_t address, uint32_t word, uint32_t delayed);
    void ORI(uint32_t address, uint32_t word, uint32_t delayed);
    void XORI(uint32_t address, uint32_t word, uint32_t delayed);
    void SLLV(uint32_t address, uint32_t word, uint32_t delayed);
    void SRLV(uint32_t address, uint32_t word, uint32_t delayed);
    void SRAV(uint32_t address, uint32_t word, uint32_t delayed);
    void SLL(uint32_t address, uint32_t word, uint32_t delayed);
    void SRL(uint32_t address, uint32_t word, uint32_t delayed);
    void SRA(uint32_t address, uint32_t word, uint32_t delayed);
    void LUI(uint32_t address, uint32_t word, uint32_t delayed);
    void MULT(uint32_t address, uint32_t word, uint32_t delayed);
    void MULTU(uint32_t address, uint32_t word, uint32_t delayed);
    void DIV(uint32_t address, uint32_t word, uint32_t delayed);
    void DIVU(uint32_t address, uint32_t word, uint32_t delayed);
    void MFHI(uint32_t address, uint32_t word, uint32_t delayed);
    void MFLO(uint32_t address, uint32_t word, uint32_t delayed);
    void MTHI(uint32_t address, uint32_t word, uint32_t delayed);
    void MTLO(uint32_t address, uint32_t word, uint32_t delayed);
    void J(uint32_t address, uint32_t word, uint32_t delayed);
    void JAL(uint32_t address, uint32_t word, uint32_t delayed);
    void JR(uint32_t address, uint32_t word, uint32_t delayed);
    void JALR(uint32_t address, uint32_t word, uint32_t delayed);
    void BEQ(uint32_t address, uint32_t word, uint32_t delayed);
    void BNE(uint32_t address, uint32_t word, uint32_t delayed);
    void BLTZ(uint32_t address, uint32_t word, uint32_t delayed);
    void BGEZ(uint32_t address, uint32_t word, uint32_t delayed);
    void BGTZ(uint32_t address, uint32_t word, uint32_t delayed);
    void BLEZ(uint32_t address, uint32_t word, uint32_t delayed);
    void BLTZAL(uint32_t address, uint32_t word, uint32_t delayed);
    void BGEZAL(uint32_t address, uint32_t word, uint32_t delayed);
    void ReservedInstruction(uint32_t address, uint32_t word, uint32_t delayed);
    void CopUnusable(uint32_t address, uint32_t word, uint32_t delayed);
    void SYSCALL(uint32_t address, uint32_t word, uint32_t delayed);
    void BREAK(uint32_t address, uint32_t word, uint32_t delayed);

    // COP0 Instructions
    void MFC0(uint32_t address, uint32_t word, uint32_t delayed);
    void MTC0(uint32_t address, uint32_t word, uint32_t delayed);
    void RFE(uint32_t address, uint32_t word, uint32_t delayed);
    void CFC0(uint32_t address, uint32_t word, uint32_t delayed);
    void CTC0(uint32_t address, uint32_t word, uint32_t delayed);
    void LWC0(uint32_t address, uint32_t word, uint32_t delayed);
    void SWC0(uint32_t address, uint32_t word, uint32_t delayed);
}
