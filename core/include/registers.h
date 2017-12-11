#pragma once

#ifndef EXTERN
#define EXTERN extern
#endif

EXTERN union {
    struct {
        uint32_t lo;
        uint32_t hi;
    } parts;
    uint64_t wide;
} mult;

EXTERN uint32_t registers[32];
EXTERN uint32_t pc;

EXTERN uint32_t start_pc;
EXTERN int clocks;

