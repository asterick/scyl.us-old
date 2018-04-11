import { Registers, Conditions, ShiftType, MSRFields } from './table';

export function bx_reg(word, address) {
    const Rm = Registers[(word & 0xf) >>> 0];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];

    return `bx${cond}	${Rn}`;
}

export function blx_reg(word, address) {
    const Rm = Registers[(word & 0xf) >>> 0];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];

    return `blx${cond}	${Rm}`;
}

export function b_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const imm = (word & 0xffffff) << 8 >> 8;

    return `b${cond}	#0x${((imm << 2) + address + 8).toString(16)}`;
}

export function bl_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const imm = (word & 0xffffff) << 8 >> 8;

    return `bl${cond}	#0x${((imm << 2) + address + 8).toString(16)}`;
}

export function stc(word, address) {
    const cp_num = (word & 0xf00) >>> 8;
    const CRd = (word & 0xf000) >>> 12;
    const imm = (word & 0xff) >>> 0;
    const N = (word & 0x400000) >>> 22;
    const P = (word & 0x1000000) >>> 24;
    const U = (word & 0x800000) >>> 23;
    const W = (word & 0x200000) >>> 21;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tstc';
}

export function ldc(word, address) {
    const cp_num = (word & 0xf00) >>> 8;
    const CRd = (word & 0xf000) >>> 12;
    const imm = (word & 0xff) >>> 0;
    const N = (word & 0x400000) >>> 22;
    const P = (word & 0x1000000) >>> 24;
    const U = (word & 0x800000) >>> 23;
    const W = (word & 0x200000) >>> 21;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tldc';
}

export function cdp(word, address) {
    const cp_num = (word & 0xf00) >>> 8;
    const op1 = (word & 0xf00000) >>> 20;
    const op2 = (word & 0xe0) >>> 5;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const CRd = (word & 0xf000) >>> 12;
    const CRn = (word & 0xf0000) >>> 16;
    const CRm = (word & 0xf) >>> 0;

    return 'failed\tcdp';
}

export function mcr(word, address) {
    const cp_num = (word & 0xf00) >>> 8;
    const op1 = (word & 0xe00000) >>> 21;
    const op2 = (word & 0xe0) >>> 5;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const CRn = (word & 0xf0000) >>> 16;
    const CRm = (word & 0xf) >>> 0;

    return 'failed\tmcr';
}

export function mrc(word, address) {
    const cp_num = (word & 0xf00) >>> 8;
    const op1 = (word & 0xe00000) >>> 21;
    const op2 = (word & 0xe0) >>> 5;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const CRn = (word & 0xf0000) >>> 16;
    const CRm = (word & 0xf) >>> 0;

    return 'failed\tmrc';
}

export function swi_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const imm = (word & 0xffffff) << 8 >> 8;

    return `swi${cond}	#0x#${imm}`;
}

export function and_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `and${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function eor_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `eor${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function sub_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `sub${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function rsb_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `rsb${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function add_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `add${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function adc_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `adc${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function sbc_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `sbc${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function rsc_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `rsc${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function tst_shift_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const shift = (word & 0xf80) >>> 7;

    return `tst${cond}${S}	${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function teq_shift_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const shift = (word & 0xf80) >>> 7;

    return `teq${cond}${S}	${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function cmp_shift_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const shift = (word & 0xf80) >>> 7;

    return `cmp${cond}${S}	${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function cmn_shift_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const shift = (word & 0xf80) >>> 7;

    return `cmn${cond}${S}	${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function orr_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `orr${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function mov_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const typ = (word & 0x60) >>> 5;

    return `mov${cond}${S}	${Rd}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function bic_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `bic${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function mvn_shift_imm(word, address) {
    const shift = (word & 0xf80) >>> 7;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const typ = (word & 0x60) >>> 5;

    return `mvn${cond}${S}	${Rd}, ${Rn}, ${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function and_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `and${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function eor_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `eor${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function sub_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `sub${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function rsb_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `rsb${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function add_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `add${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function adc_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `adc${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function sbc_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `sbc${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function rsc_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `rsc${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function tst_shift_reg(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const Rs = Registers[(word & 0xf00) >>> 8];

    return `tst${cond}${S}	${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function teq_shift_reg(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const Rs = Registers[(word & 0xf00) >>> 8];

    return `teq${cond}${S}	${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function cmp_shift_reg(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const Rs = Registers[(word & 0xf00) >>> 8];

    return `cmp${cond}${S}	${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function cmn_shift_reg(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;
    const Rs = Registers[(word & 0xf00) >>> 8];

    return `cmn${cond}${S}	${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function orr_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `orr${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function mov_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const typ = (word & 0x60) >>> 5;

    return `mov${cond}${S}	${Rd}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function bic_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `bic${cond}${S}	${Rd}, ${Rn}, ${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function mvn_shift_reg(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const typ = (word & 0x60) >>> 5;

    return `mvn${cond}${S}	${Rd}, ${Rn},${Rm}, ${ShiftType[typ]} ${Rs}`;
}

export function and_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `and${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function eor_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `eor${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function sub_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `sub${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function rsb_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `rsb${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function add_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `add${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function adc_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `adc${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function sbc_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `sbc${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function rsc_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `rsc${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function tst_rot_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `tst${cond}${S}	${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function teq_rot_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `teq${cond}${S}	${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function cmp_rot_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `cmp${cond}${S}	${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function cmn_rot_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `cmn${cond}${S}	${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function orr_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `orr${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function mov_rot_imm(word, address) {
    const Rd = Registers[(word & 0xf000) >>> 12];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `mov${cond}${S}	${Rd}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function bic_rot_imm(word, address) {
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `bic${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function mvn_rot_imm(word, address) {
    const Rd = Registers[(word & 0xf000) >>> 12];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;

    return `mvn${cond}${S}	${Rd}, ${Rn}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function swp(word, address) {
    const Rd = Registers[(word & 0xf000) >>> 12];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];

    return `swp${cond}${S}	${Rd}, ${Rm}, ${Rs}, ${Rn}`;
}

export function cswp(word, address) {
    const Rd = Registers[(word & 0xf000) >>> 12];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];

    return `cswp${cond}${S}	${Rd}, ${Rm}, ${Rs}, ${Rn}`;
}

export function mul(word, address) {
    const Rd = Registers[(word & 0xf0000) >>> 16];
    const Rm = Registers[(word & 0xf) >>> 0];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rs = Registers[(word & 0xf00) >>> 8];

    return `mul${cond}${S}	${Rd}, ${Rm}, ${Rs}`;
}

export function mla(word, address) {
    const Rs = Registers[(word & 0xf00) >>> 8];
    const Rd = Registers[(word & 0xf0000) >>> 16];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf000) >>> 12];

    return `mla${cond}${S}	${Rd}, ${Rm}, ${Rs}, ${Rn}`;
}

export function umull(word, address) {
    const RdLo = (word & 0xf000) >>> 12;
    const Rs = Registers[(word & 0xf00) >>> 8];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const RdHi = (word & 0xf0000) >>> 16;
    const Rm = Registers[(word & 0xf) >>> 0];

    return `umull${cond}${S}	${RdLo}, ${RdHi}, ${Rm}, ${Rs}`;
}

export function umlal(word, address) {
    const RdLo = (word & 0xf000) >>> 12;
    const Rs = Registers[(word & 0xf00) >>> 8];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const RdHi = (word & 0xf0000) >>> 16;
    const Rm = Registers[(word & 0xf) >>> 0];

    return `umlal${cond}${S}	${RdLo}, ${RdHi}, ${Rm}, ${Rs}`;
}

export function smull(word, address) {
    const RdLo = (word & 0xf000) >>> 12;
    const Rs = Registers[(word & 0xf00) >>> 8];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const RdHi = (word & 0xf0000) >>> 16;
    const Rm = Registers[(word & 0xf) >>> 0];

    return `smull${cond}${S}	${RdLo}, ${RdHi}, ${Rm}, ${Rs}`;
}

export function smlal(word, address) {
    const RdLo = (word & 0xf000) >>> 12;
    const Rs = Registers[(word & 0xf00) >>> 8];
    const S = ((word & 0x100000) >>> 20) ? "s" : "";
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const RdHi = (word & 0xf0000) >>> 16;
    const Rm = Registers[(word & 0xf) >>> 0];

    return `smlal${cond}${S}	${RdLo}, ${RdHi}, ${Rm}, ${Rs}`;
}

export function mrs(word, address) {
    const Rd = Registers[(word & 0xf000) >>> 12];
    const S = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];

    return `mrs${cond}	${Rd}, ${S ? 'spsr' : 'cspr'}`;
}

export function msr_reg(word, address) {
    const Rm = Registers[(word & 0xf) >>> 0];
    const S = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const field_mask = MSRFields[(word & 0xf0000) >>> 16];

    return `msr${cond}	${S ? 'spsr' : 'cspr'}_${field_mask}, ${Rm}`;
}

export function msr_rot_imm(word, address) {
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const S = (word & 0x400000) >>> 22;
    const rotate = ((word & 0xf00) >>> 8) * 2;
    const imm = (word & 0xff) >>> 0;
    const field_mask = MSRFields[(word & 0xf0000) >>> 16];

    return `msr${cond}	${S ? 'spsr' : 'cspr'}_${field_mask}, ${(imm << rotate) | (imm >>> (32 - rotate))}`;
}

export function str_post_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `str${cond}${B}	${Rd}, [${Rn}], #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function ldr_post_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `ldr${cond}${B}	${Rd}, [${Rn}], #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function strt_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `str${cond}${B}t	${Rd}, [${Rn}], #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function ldrt_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `ldr${cond}${B}t	${Rd}, [${Rn}], #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}`;
}

export function str_pre_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `str${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}]`;
}

export function ldr_pre_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `ldr${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}]`;
}

export function str_pre_wb_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `str${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}]!`;
}

export function ldr_pre_wb_shift_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const shift = (word & 0xf80) >>> 7;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const Rm = Registers[(word & 0xf) >>> 0];
    const Rn = Registers[(word & 0xf0000) >>> 16];
    const typ = (word & 0x60) >>> 5;

    return `ldr${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}]!`;
}

export function str_post_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `str${cond}${B}	${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`;
}

export function ldr_post_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `ldr${cond}${B}	${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`;
}

export function strt_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `str${cond}${B}t	${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`;
}

export function ldrt_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `ldr${cond}${B}t	${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`;
}

export function str_pre_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `str${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]`;
}

export function ldr_pre_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `ldr${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]`;
}

export function str_pre_wb_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `str${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]!`;
}

export function ldr_pre_wb_imm(word, address) {
    const B = (word & 0x400000) >>> 22 ? "b" : "";
    const imm = (word & 0xfff) >>> 0;
    const Rd = Registers[(word & 0xf000) >>> 12];
    const U = (word & 0x800000) >>> 23;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return `ldr${cond}${B}	${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]!`;
}

export function stm_reglist(word, address) {
    const reg_list = (word & 0xffff) >>> 0;
    const P = (word & 0x1000000) >>> 24;
    const S = (word & 0x400000) >>> 22;
    const U = (word & 0x800000) >>> 23;
    const W = (word & 0x200000) >>> 21;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tstm_reglist';
}

export function ldm_reglist(word, address) {
    const reg_list = (word & 0xffff) >>> 0;
    const P = (word & 0x1000000) >>> 24;
    const S = (word & 0x400000) >>> 22;
    const U = (word & 0x800000) >>> 23;
    const W = (word & 0x200000) >>> 21;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tldm_reglist';
}

export function strh(word, address) {
    const I = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const P = (word & 0x1000000) >>> 24;
    const addr_mode = (word & 0xf00) >>> 8;
    const W = (word & 0x200000) >>> 21;
    const U = (word & 0x800000) >>> 23;
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tstrh';
}

export function ldrh(word, address) {
    const I = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const P = (word & 0x1000000) >>> 24;
    const addr_mode = (word & 0xf00) >>> 8;
    const W = (word & 0x200000) >>> 21;
    const U = (word & 0x800000) >>> 23;
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tldrh';
}

export function ldrsb(word, address) {
    const I = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const P = (word & 0x1000000) >>> 24;
    const addr_mode = (word & 0xf00) >>> 8;
    const W = (word & 0x200000) >>> 21;
    const U = (word & 0x800000) >>> 23;
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tldrsb';
}

export function ldrsh(word, address) {
    const I = (word & 0x400000) >>> 22;
    const cond = Conditions[ (word & 0xf0000000) >>> 28 ];
    const Rd = Registers[(word & 0xf000) >>> 12];
    const P = (word & 0x1000000) >>> 24;
    const addr_mode = (word & 0xf00) >>> 8;
    const W = (word & 0x200000) >>> 21;
    const U = (word & 0x800000) >>> 23;
    const Rn = Registers[(word & 0xf0000) >>> 16];

    return 'failed\tldrsh';
}

