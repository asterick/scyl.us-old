#pragma once

#include <stdint.h>

struct RegisterSet {
    uint32_t* cpsr;
    uint32_t* spsr;
    uint32_t* r[16];
};

extern const RegisterSet regs_usr;
extern const RegisterSet regs_fiq;
extern const RegisterSet regs_svt;
extern const RegisterSet regs_abt;
extern const RegisterSet regs_irq;
extern const RegisterSet regs_und;
extern uint32_t reg_pc;
extern uint32_t reg_cspr;
