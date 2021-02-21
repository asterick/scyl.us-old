#pragma once

extern "C" {
    void AUIPC(uint32_t address, uint32_t word);
    void LUI(uint32_t address, uint32_t word);
    void JAL(uint32_t address, uint32_t word);

    void ReservedInstruction(uint32_t address, uint32_t word);
}
