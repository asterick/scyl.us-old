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

#define CSPR_N_FLAG		0x80000000
#define CSPR_Z_FLAG		0x40000000
#define CSPR_C_FLAG		0x20000000
#define CSPR_V_FLAG		0x10000000
#define CSPR_Q_FLAG		0x08000000
#define CSPR_I_FLAG		0x00000080
#define CSPR_F_FLAG		0x00000040
#define CSPR_T_FLAG		0x00000020
#define CSPR_MODE_MASK	0x0000001F

enum CSPR_MODE {
	CSPR_MODE_USR = 0x10,
	CSPR_MODE_FIQ = 0x11,
	CSPR_MODE_IRQ = 0x12,
	CSPR_MODE_SVT = 0x13,
	CSPR_MODE_ABT = 0x17,
	CSPR_MODE_UND = 0x1B,
};
