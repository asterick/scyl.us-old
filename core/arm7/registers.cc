#include <stdint.h>
#include <stddef.h>

#include "compiler.h"
#include "registers.h"

static uint32_t reg_r_usr[15]; // User-mode registers
static uint32_t reg_r_fiq[7];   // FIQ registers
static uint32_t reg_r_svc[2];   // Supervisor registers
static uint32_t reg_r_abt[2];   // Abort registers
static uint32_t reg_r_irq[2];   // IRQ registers
static uint32_t reg_r_und[2];   // Undefined registers

uint32_t reg_pc;
uint32_t reg_cspr;
static uint32_t spsr_usr, spsr_fiq, spsr_svc, spsr_abt, spsr_irq, spsr_und;

struct RegisterDesc {
    const char* name;
    const uint32_t* reg;
};

static const RegisterDesc reg_space[] = {
    {      "pc",        &reg_pc },
    {    "cspr",      &reg_cspr },
    {      "r0", &reg_r_usr[ 0] },
    {      "r1", &reg_r_usr[ 1] },
    {      "r2", &reg_r_usr[ 2] },
    {      "r3", &reg_r_usr[ 3] },
    {      "r4", &reg_r_usr[ 4] },
    {      "r5", &reg_r_usr[ 5] },
    {      "r6", &reg_r_usr[ 6] },
    {      "r7", &reg_r_usr[ 7] },
    {      "r8", &reg_r_usr[ 8] },
    {      "r9", &reg_r_usr[ 9] },
    {     "r10", &reg_r_usr[10] },
    {     "r11", &reg_r_usr[11] },
    {     "r12", &reg_r_usr[12] },
    {      "sp", &reg_r_usr[13] },
    {      "lr", &reg_r_usr[14] },
    {  "r8_fiq", &reg_r_fiq[ 0] },
    {  "r9_fiq", &reg_r_fiq[ 1] },
    { "r10_fiq", &reg_r_fiq[ 2] },
    { "r11_fiq", &reg_r_fiq[ 3] },
    { "r12_fiq", &reg_r_fiq[ 4] },
    {  "sp_fiq", &reg_r_fiq[ 5] },
    {  "lr_fiq", &reg_r_fiq[ 6] },
    {  "sp_svc", &reg_r_svc[ 0] },
    {  "lr_svc", &reg_r_svc[ 1] },
    {  "sp_abt", &reg_r_abt[ 0] },
    {  "lr_abt", &reg_r_abt[ 1] },
    {  "sp_irq", &reg_r_irq[ 0] },
    {  "lr_urq", &reg_r_irq[ 1] },
    {  "sp_und", &reg_r_und[ 0] },
    {  "lr_und", &reg_r_und[ 1] },
    { NULL }
};

EXPORT const RegisterDesc* get_registers() {
    return reg_space;
}

const RegisterSet regs_usr = {
    &reg_cspr,
    &spsr_usr,  // Actually unused
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_usr[ 8],
        &reg_r_usr[ 9],
        &reg_r_usr[10],
        &reg_r_usr[11],
        &reg_r_usr[12],
        &reg_r_usr[13],
        &reg_r_usr[14],
        &reg_pc
    }    
};

const RegisterSet regs_fiq = {
    &reg_cspr,
    &spsr_fiq,
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_fiq[ 0],
        &reg_r_fiq[ 1],
        &reg_r_fiq[ 2],
        &reg_r_fiq[ 3],
        &reg_r_fiq[ 4],
        &reg_r_fiq[ 5],
        &reg_r_fiq[ 6],
        &reg_pc
    }
};

const RegisterSet regs_svc = {
    &reg_cspr,
    &spsr_svc,
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_usr[ 8],
        &reg_r_usr[ 9],
        &reg_r_usr[10],
        &reg_r_usr[11],
        &reg_r_usr[12],
        &reg_r_svc[ 0],
        &reg_r_svc[ 1],
        &reg_pc
    },
};

const RegisterSet regs_abt = {
    &reg_cspr,
    &spsr_abt,
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_usr[ 8],
        &reg_r_usr[ 9],
        &reg_r_usr[10],
        &reg_r_usr[11],
        &reg_r_usr[12],
        &reg_r_abt[ 0],
        &reg_r_abt[ 1],
        &reg_pc
    }
};

const RegisterSet regs_irq = {
    &reg_cspr,
    &spsr_irq,
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_usr[ 8],
        &reg_r_usr[ 9],
        &reg_r_usr[10],
        &reg_r_usr[11],
        &reg_r_usr[12],
        &reg_r_irq[ 0],
        &reg_r_irq[ 1],
        &reg_pc
    }
};

const RegisterSet regs_und = {
    &reg_cspr,
    &spsr_und,
    {
        &reg_r_usr[ 0],
        &reg_r_usr[ 1],
        &reg_r_usr[ 2],
        &reg_r_usr[ 3],
        &reg_r_usr[ 4],
        &reg_r_usr[ 5],
        &reg_r_usr[ 6],
        &reg_r_usr[ 7],
        &reg_r_usr[ 8],
        &reg_r_usr[ 9],
        &reg_r_usr[10],
        &reg_r_usr[11],
        &reg_r_usr[12],
        &reg_r_und[ 0],
        &reg_r_und[ 1],
        &reg_pc
    }
};
