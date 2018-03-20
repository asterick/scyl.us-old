#pragma once

#include <stdint.h>
#include "compiler.h"

EXPORT void dma_advance();
uint32_t dma_read(uint32_t);
void dma_write(uint32_t, uint32_t, uint32_t);

