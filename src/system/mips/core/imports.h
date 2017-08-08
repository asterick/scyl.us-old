#pragma once

//uint32_t translate(uint32_t address, uint32_t write, uint32_t pc, uint32_t delayed);
uint32_t load(uint32_t address, uint32_t pc, uint32_t delayed);
uint32_t store(uint32_t address, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);

uint32_t exception(uint32_t code, uint32_t pc, uint32_t delayed, uint32_t cop);

void execute(uint32_t, uint32_t);
void debug(uint32_t);

// COP0 functions
uint32_t mfc0(uint32_t, uint32_t, uint32_t);
uint32_t mtc0(uint32_t, uint32_t, uint32_t, uint32_t);
uint32_t rfe(uint32_t, uint32_t);
uint32_t tlbr(uint32_t, uint32_t);
uint32_t tlbwi(uint32_t, uint32_t);
uint32_t tlbwr(uint32_t, uint32_t);
uint32_t tlbp(uint32_t, uint32_t);
