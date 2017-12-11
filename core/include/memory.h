#pragma once

uint32_t load(uint32_t logical, uint32_t code, uint32_t pc, uint32_t delayed);
void store(uint32_t logical, uint32_t value, uint32_t mask, uint32_t pc, uint32_t delayed);