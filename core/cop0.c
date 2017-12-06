#include "types.h"
#include "fields.h"
#include "consts.h"

#include "imports.h"

#include "registers.h"
#include "helper.h"

// ******
// ** Co-Processor Move registers
// ******

void MFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	write_reg(FIELD_RT(word), mfc0(FIELD_RD(word), address, delayed));
}

void MTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	mtc0(FIELD_RD(word), read_reg(FIELD_RT(word)), address, delayed);
}

// ******
// ** Co-Processor instructions
// ******

void RFE(uint32_t address, uint32_t word, uint32_t delayed) {
	rfe(address, delayed);
}

void TLBR(uint32_t address, uint32_t word, uint32_t delayed) {
	tlbr(address, delayed);
}

void TLBWI(uint32_t address, uint32_t word, uint32_t delayed) {
	tlbwi(address, delayed);
}

void TLBWR(uint32_t address, uint32_t word, uint32_t delayed) {
	tlbwr(address, delayed);
}

void TLBP(uint32_t address, uint32_t word, uint32_t delayed) {
	tlbp(address, delayed);
}

// ***********
// ** Unused move instructions
// ***********
void CFC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void CTC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void LWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}

void SWC0(uint32_t address, uint32_t word, uint32_t delayed) {
	exception(EXCEPTION_COPROCESSORUNUSABLE, address, delayed, 0);
}
