#pragma once

uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed);
void trap(int exception, int address, int delayed, int coprocessor);
void resetCOP0();
