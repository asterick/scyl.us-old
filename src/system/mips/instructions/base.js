import * as COP0 from "./cop0";
import { read, write, exception, REGS, CALLS } from "./wast";

// For the preprocessor to work, the name has to be pinned
const Exception = require("../exception").default;
const Consts = require("../consts");

/******
 ** Trap Instructions
 ******/

function ReservedInstruction(pc, delayed) {
    return exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}
ReservedInstruction.assembly = () => `---`;

function CopUnusable(pc, delayed, cop) {
    return exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed, cop);
}
CopUnusable.assembly = (cop) => `COP${cop}\tunusable`;

/******
 ** Load/Store instructions
 ******/

function LB(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),

        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },
        { op: "i32.const", value: 24 },
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "i32.sub" },
        { op: "i32.shl" },
        { op: "i32.shr_s" },

        ... write(rt)
    ];
}
LB.assembly = (rs, rt, imm16) => `lb\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LBU(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },
        { op: "i32.const", value: 24 },
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "i32.sub" },
        { op: "i32.shl" },
        { op: "i32.shr_u" },
        ... write(rt)
    ];
}
LBU.assembly = (rs, rt, imm16) => `lbu\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LH(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },

        { op: "i32.const", value: 1 },
        { op: "i32.and" },

        { op: "if", block: exception(Consts.Exceptions.AddressLoad, pc, delayed) },

        { op: "get_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },

        { op: "i32.const", value: 16 },
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 2 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },

        { op: "i32.sub" },
        { op: "i32.shl" },
        { op: "i32.shr_s" },
        ... write(rt)
    ];
}
LH.assembly = (rs, rt, imm16) => `lh\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LHU(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 1 },
        { op: "i32.and" },
        { op: "if", block: exception(Consts.Exceptions.AddressLoad, pc, delayed) },
        { op: "get_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },
        { op: "i32.const", value: 16 },
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 2 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "i32.sub" },
        { op: "i32.shl" },
        { op: "i32.shr_u" },
        ... write(rt)
    ];
}
LHU.assembly = (rs, rt, imm16) => `lhu\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LW(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "if", block: exception(Consts.Exceptions.AddressLoad, pc, delayed) },
        { op: "get_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },
        ... write(rt)
    ];
}
LW.assembly = (rs, rt, imm16) => `lw\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function SB(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        ... read(rt),
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.shl" },
        { op: "i32.const", value: 0xFF },
        { op: "get_local", index: 0 },
        { op: "i32.shl" },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.STORE },
    ]
}
SB.assembly = (rs, rt, imm16) => `sb\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function SH(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 1 },
        { op: "i32.and" },
        { op: "if", block: exception(Consts.Exceptions.AddressStore, pc, delayed) },
        { op: "get_local", index: 0 },
        ... read(rt),
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.shl" },
        { op: "i32.const", value: 0xFFFF },
        { op: "get_local", index: 0 },
        { op: "i32.shl" },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.STORE }
    ]
}
SH.assembly = (rs, rt, imm16) => `sh\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function SW(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "if", block: exception(Consts.Exceptions.AddressStore, pc, delayed) },
        { op: "get_local", index: 0 },
        ... read(rt),
        { op: "i32.const", value: -1 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.STORE }
    ]
}
SW.assembly = (rs, rt, imm16) => `sw\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LWR(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },

        { op: "tee_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },

        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.shr_u" },

        ... read(rt),

        { op: "i32.const", value: -1 },
        { op: "get_local", index: 0 },
        { op: "i32.shr_u" },
        { op: "i32.const", value: -1 },
        { op: "i32.xor" },
        { op: "i32.and" },

        { op: "i32.or" },
        ... write(rt)
    ];
}

LWR.assembly = (rs, rt, imm16) => `lwr\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function LWL(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 1 },
        { op: "i32.add" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.const", value: 32 },
        { op: "i32.eq" },
        { op: "br_if", relative_depth: 1 },

        { op: "get_local", index: 0 },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.LOAD },

        { op: "i32.const", value: 32 },
        { op: "get_local", index: 0 },
        { op: "i32.sub" },
        { op: "i32.shl" },

        ... read(rt),
        { op: "i32.const", value: -1 },
        { op: "i32.shr_u" },
        { op: "i32.and" },
        { op: "i32.or" },
        ... write(rt)
    ];
}
LWL.assembly = (rs, rt, imm16) => `lwl\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function SWR(rt, rs, imm16, pc, delayed) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },
        ... read(rt),
        { op: "get_local", index: 0 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.shl" },
        { op: "i32.const", value: -1 },
        { op: "get_local", index: 0 },
        { op: "i32.shl" },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.STORE }
    ]
}
SWR.assembly = (rs, rt, imm16) => `swr\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

function SWL(rt, rs, imm16, pc, delayed) {
    return [
        ... imm16,
        { op: "i32.add" },
        { op: "tee_local", index: 0 },

        { op: "i32.const", value: 32 },
        { op: "i32.const", value: 3 },
        { op: "i32.and" },
        { op: "i32.const", value: 1 },
        { op: "i32.add" },
        { op: "i32.const", value: 8 },
        { op: "i32.mul" },
        { op: "tee_local", index: 0 },
        { op: "i32.sub" },
        { op: "i32.eqz" },
        { op: "br_if", relative_depth: 1 },

        { op: "get_local", index: 0 },

        ... read(rt),
        { op: "get_local", index: 0 },
        { op: "i32.shr_u" },

        { op: "i32.const", value: -1 },
        { op: "get_local", index: 0 },
        { op: "i32.shr_u" },
        ... pc,
        ... delayed,
        { op: "call", function_index: CALLS.STORE }
    ];
}
SWL.assembly = (rs, rt, imm16) => `swl\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

/******
 ** Arithmatic instructions
 ******/

function ADD(rd, rs, rt, pc, delayed) {
    return [
        ... read(rs),
        { op: "i64.extend_s/i32" },
        ... read(rt),
        { op: "i64.extend_s/i32" },
        { op: "i64.add" },

        { op: "tee_local", index: 1 },
        { op: "i64.const", value: -0x80000000 },
        { op: "i64.lt_s" },

        { op: "get_local", index: 1 },
        { op: "i64.const", value: 0x80000000 },
        { op: "i64.ge_s" },

        { op: "i32.or" },
        { op: "if", block: exception(Consts.Exceptions.Overflow, pc, delayed) },

        { op: "get_local", index: 1 },
        { op: "i32.wrap/i64" },
        ... write(rd)
    ]
}
ADD.assembly = (rd, rs, rt) => rd ? `add\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function ADDU(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.add" },
        ... write(rd)
    ]
}
ADDU.assembly = (rd, rs, rt) => rd ? `addu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function SUB(rd, rs, rt, pc, delayed) {
    return [
        ... read(rs),
        { op: "i64.extend_s/i32" },
        ... read(rt),
        { op: "i64.extend_s/i32" },
        { op: "i64.sub" },

        { op: "tee_local", index: 1 },
        { op: "i64.const", value: -0x80000000 },
        { op: "i64.lt_s" },

        { op: "get_local", index: 1 },
        { op: "i64.const", value: 0x80000000 },
        { op: "i64.ge_s" },

        { op: "i32.or" },
        { op: "if", block: exception(Consts.Exceptions.Overflow, pc, delayed) },

        { op: "get_local", index: 1 },
        { op: "i32.wrap/i64" },
        ... write(rd)
    ]}
SUB.assembly = (rd, rs, rt) => rd ? `sub\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function SUBU(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.sub" },
        ... write(rd)
    ]
}
SUBU.assembly = (rd, rs, rt) => rd ? `subu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function ADDI(rt, rs, simm16, pc, delayed) {
    return [
        ... read(rs),
        { op: "i64.extend_s/i32" },
        ... simm16,
        { op: "i64.extend_s/i32" },
        { op: "i64.add" },

        { op: "tee_local", index: 1 },
        { op: "i64.const", value: -0x80000000 },
        { op: "i64.lt_s" },

        { op: "get_local", index: 1 },
        { op: "i64.const", value: 0x80000000 },
        { op: "i64.ge_s" },

        { op: "i32.or" },
        { op: "if", block: exception(Consts.Exceptions.Overflow, pc, delayed) },

        { op: "get_local", index: 1 },
        { op: "i32.wrap/i64" },
        ... write(rt)
    ]
}
ADDI.assembly = (rt, rs, simm16) => rt ? `addi\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}` : "nop";

function ADDIU(rt, rs, simm16) {
    return [
        ... read(rs),
        ... simm16,
        { op: "i32.add" },
        ... write(rt)
    ];
}

ADDIU.assembly = (rt, rs, simm16) => rt ? `addiu\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}` : "nop";

/******
 ** Comparison instructions
 ******/
function SLT(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: 'i32.lt_s'},
        ... write(rd)
    ];
}
SLT.assembly = (rd, rs, rt) => `slt\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function SLTU(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: 'i32.lt_u'},
        ... write(rd)
    ];
}
SLTU.assembly = (rd, rs, rt) => `sltu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function SLTI(rt, rs, simm16) {
    return [
        ... read(rs),
        ... simm16,
        { op: 'i32.lt_s'},
        ... write(rt)
    ]
}
SLTI.assembly = (rt, rs, simm16) => `slti\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}`;

function SLTIU(rt, rs, simm16) {
    return [
        ... read(rs),
        ... simm16,
        { op: 'i32.lt_u'},
        ... write(rt)
    ]
}
SLTIU.assembly = (rt, rs, simm16) => `sltiu\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${(simm16 >>> 0).toString(16)}`;

/******
 ** Logical instructions
 ******/

function AND(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.and" },
        ... write(rd)
    ]
}
AND.assembly = (rd, rs, rt) => rd ? `and\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function OR(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.or" },
        ... write(rd)
    ]
}
OR.assembly = (rd, rs, rt) => rd ? `or\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function XOR(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.xor" },
        ... write(rd)
    ]
}
XOR.assembly = (rd, rs, rt) => rd ? `xor\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function NOR(rd, rs, rt) {
    return [
        ... read(rs),
        ... read(rt),
        { op: "i32.or" },
        { op: "i32.const", value: -1 },
        { op: "i32.xor" },
        ... write(rd)
    ]
}
NOR.assembly = (rd, rs, rt) => rd ? `nor\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function ANDI(rt, rs, imm16) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.and" },
        ... write(rt)
    ]
}
ANDI.assembly = (rt, rs, imm16) => rt ? `andi\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";

function ORI(rt, rs, imm16) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.or" },
        ... write(rt)
    ]
}
ORI.assembly = (rt, rs, imm16) => rt ? `ori\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";

function XORI(rt, rs, imm16) {
    return [
        ... read(rs),
        ... imm16,
        { op: "i32.xor" },
        ... write(rt)
    ]
}
XORI.assembly = (rt, rs, imm16) => rt ? `xori\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";

/******
 ** Shift instructions
 ******/

function SLLV(rd, rt, rs) {
    return [
        ... read(rt),
        ... read(rs),
        { op: "i32.const", value: 0x1F },
        { op: "i32.and" },
        { op: "i32.shl" },
        ... write(rd)
    ]
}
SLLV.assembly = (rd, rt, rs) => rd ? `sllv\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function SRLV(rd, rt, rs) {
    return [
        ... read(rt),
        ... read(rs),
        { op: "i32.const", value: 0x1F },
        { op: "i32.and" },
        { op: "i32.shr_u" },
        ... write(rd)
    ]
}
SRLV.assembly = (rd, rt, rs) => rd ? `srlv\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function SRAV(rd, rt, rs) {
    return [
        ... read(rt),
        ... read(rs),
        { op: "i32.const", value: 0x1F },
        { op: "i32.and" },
        { op: "i32.shr_s" },
        ... write(rd)
    ]
}
SRAV.assembly = (rd, rt, rs) => rd ? `srav\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";

function SLL(rd, rt, shamt) {
    return [
        ... read(rt),
        ... shamt,
        { op: "i32.shl" },
        ... write(rd)
    ]
}
SLL.assembly = (rd, rt, shamt) => rd ? `sll\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";

function SRL(rd, rt, shamt) {
    return [
        ... read(rt),
        ... shamt,
        { op: "i32.shr_u" },
        ... write(rd)
    ]
}
SRL.assembly = (rd, rt, shamt) => rd ? `srl\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";

function SRA(rd, rt, shamt) {
    return [
        ... read(rt),
        ... shamt,
        { op: "i32.shr_s" },
        ... write(rd)
    ]
}
SRA.assembly = (rd, rt, shamt) => rd ? `sra\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";

function LUI(rt, imm16) {
    return [
        ... imm16,
        { op: "i32.const", value: 16 },
        { op: "i32.shl" },
        ... write(rt)
    ]
}
LUI.assembly = (rt, imm16) => `lui\t${Consts.Registers[rt]}, $${imm16.toString(16)}`;

/******
 ** Multiply/Divide instructions
 ******/
function MULT(rs, rt) {
    return [
        ... read(rs),
        { op: "i64.extend_s/i32" },
        ... read(rt),
        { op: "i64.extend_s/i32" },
        { op: "i64.mul" },

        { op: "tee_local", index: 1 },
        { op: "i32.wrap/i64" },
        ... write(REGS.LO),

        { op: "get_local", index: 1 },
        { op: "i64.const", value: 32 },
        { op: "i64.shr_u" },
        { op: "i32.wrap/i64" },
        ... write(REGS.HI)
    ]
}
MULT.assembly = (rs, rt) => `mult\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function MULTU(rs, rt) {
    return [
        ... read(rs),
        { op: "i64.extend_u/i32" },
        ... read(rt),
        { op: "i64.extend_u/i32" },
        { op: "i64.mul" },

        { op: "tee_local", index: 1 },
        { op: "i32.wrap/i64" },
        ... write(REGS.LO),

        { op: "get_local", index: 1 },
        { op: "i64.const", value: 32 },
        { op: "i64.shr_u" },
        { op: "i32.wrap/i64" },
        ... write(REGS.HI)
    ]
}
MULTU.assembly = (rs, rt) => `multu\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function DIV(rs, rt) {
    return [
        ... read(rs),
        { op: "i32.const", value: -0x80000000 },
        { op: "i32.eq" },
        ... read(rt),
        { op: "i32.const", value: -1 },
        { op: "i32.eq" },
        { op: "i32.and" },
        { op: "if", block: [
            { op: "i32.const", value: -0x80000000 },
            ... write(REGS.HI),
            { op: "i32.const", value: 0 },
            ... write(REGS.LO),
        { op: "else" },
        ... read(rt),
        { op: "i32.eqz" },
        { op: "if", block: [
            ... read(rs),
            ... write(REGS.HI),

            ... read(rs),
            { op: "i32.const", value: -1 },
            { op: "i32.xor"},
            { op: "i32.const", value: 31 },
            { op: "i32.shr_s"},
            ... write(REGS.LO),

        { op: "else" },
            ... read(rs),
            ... read(rt),
            { op: "i32.rem_s"},
            ... write(REGS.HI),
            ... read(rs),
            ... read(rt),
            { op: "i32.div_s"},
            ... write(REGS.LO),
        ]}
        ]}
    ]
}
DIV.assembly = (rs, rt) => `div\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function DIVU(rs, rt) {
    return [
        ... read(rt),
        { op: "i32.eqz" },
        { op: "if", block: [
            ... read(rs),
            ... write(REGS.HI),
            { op: "i32.const", value: -1 },
            ... write(REGS.LO),
        { op: "else" },
            ... read(rs),
            ... read(rt),
            { op: "i32.rem_u"},
            ... write(REGS.HI),
            ... read(rs),
            ... read(rt),
            { op: "i32.div_u"},
            ... write(REGS.LO),
        ]}
    ]
}
DIVU.assembly = (rs, rt) => `divu\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;

function MFHI(rd) {
    return [
        ... read(REGS.HI),
        ... write(rd)
    ];
}
MFHI.assembly = (rd) => `mfhi\t${Consts.Registers[rd]}`;

function MFLO(rd) {
    return [
        ... read(REGS.LO),
        ... write(rd)
    ];
}
MFLO.assembly = (rd) => `mflo\t${Consts.Registers[rd]}`;

function MTHI(rs) {
    return [
        ... read(rs),
        ... write(REGS.HI)
    ];
}
MTHI.assembly = (rs) => `mthi\t${Consts.Registers[rs]}`;

function MTLO(rs) {
    return [
        ... read(rs),
        ... write(REGS.LO)
    ];
}
MTLO.assembly = (rs) => `mtlo\t${Consts.Registers[rs]}`;

/******
 ** Branching instructions
 ******/

function J(pc, imm26, delay, escape) {
    return [
        ... delay(),
        ... ((pc & 0xF0000000) | (imm26 * 4)) >>> 0,
        ... write(REGS.PC),
        ... escape()
    ];
}
J.assembly = (pc, imm26) => `j\t$${(((pc & 0xF0000000) | (imm26 * 4)) >>> 0).toString(16)}`;

function JAL(pc, imm26, delay, escape) {
    return [
        ... delay(),
        ... pc,
        { op: 'i32.const', value: 8 },
        { op: 'i32.add' },
        ... write(31),
        ... ((pc & 0xF0000000) | (imm26 * 4)) >>> 0,
        ... write(REGS.PC),
        ... escape()
    ];
}
JAL.assembly = (pc, imm26) => `jal\t$${(((pc & 0xF0000000) | (imm26 * 4)) >>> 0).toString(16)}`;

function JR(rs, pc, delay, escape) {
    return [
        ... delay(),
        ... read(rs),
        { op: 'i32.const', value: 0xFFFFFFFC },
        { op: 'i32.and' },
        ... write(REGS.PC),
        ... escape()
    ];
}
JR.assembly = (rs) => `jr\t${Consts.Registers[rs]}`;

function JALR(rs, rd, pc, delay, escape) {
    return [
        ... delay(),
        ... pc,
        { op: 'i32.const', value: 8 },
        { op: 'i32.add' },
        ... write(rd),
        ... read(rs),
        { op: 'i32.const', value: 0xFFFFFFFC },
        { op: 'i32.and' },
        ... write(REGS.PC),
        ... escape()
    ];
}
JALR.assembly = (rs, rd) => `jalr\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}`;

function BEQ(pc, rs, rt, simm16, delay, escape) {
    return [
        ... read(rs),
        ... read(rt),
        { op: 'i32.eq' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BEQ.assembly = (pc, rs, rt, simm16) => `beq\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BNE(pc, rs, rt, simm16, delay, escape) {
    return [
        ... read(rs),
        ... read(rt),
        { op: 'i32.eq' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),

        ... escape()
    ];
}
BNE.assembly = (pc, rs, rt, simm16) => `bne\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BLTZ(pc, rs, simm16, delay, escape) {
    return [
        ... read(rs),
        { op: 'i32.const', value: 0 },
        { op: 'i32.ge_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BLTZ.assembly = (pc, rs, simm16) => `bltz\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BGEZ(pc, rs, simm16, delay, escape) {
    return [
        ... read(rs),
        { op: 'i32.const', value: 0 },
        { op: 'i32.lt_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BGEZ.assembly = (pc, rs, simm16) => `bgez\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BGTZ(pc, rs, simm16, delay, escape) {
    return [
        ... read(rs),
        { op: 'i32.const', value: 0 },
        { op: 'i32.le_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BGTZ.assembly = (pc, rs, simm16) => `bgtz\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BLEZ(pc, rs, simm16, delay, escape) {
    return [
        ... read(rs),
        { op: 'i32.const', value: 0 },
        { op: 'i32.gt_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),

        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },

        ... write(REGS.PC),
        ... escape()
    ];
}
BLEZ.assembly = (pc, rs, simm16) => `blez\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BLTZAL(pc, rs, simm16, delay, escape) {
    return [
        ... read(rs),
        { op: 'i32.const', value: 0 },
        { op: 'i32.ge_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),
        ... pc,
        { op: 'i32.const', value: 8 },
        { op: 'i32.add' },
        ... write(31),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BLTZAL.assembly = (pc, rs, simm16) => `bltzal\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function BGEZAL(pc, rs, simm16, delay, escape) {
    return [
        { op: 'i32.const', value: 0 },
        ... read(rs),
        { op: 'i32.lt_s' },
        { op: 'br_if', relative_depth: 1 },

        ... delay(),

        ... pc,
        { op: 'i32.const', value: 8 },
        { op: 'i32.add' },

        ... write(31),
        ... simm16,
        { op: 'i32.const', value: 4 },
        { op: 'i32.mul' },
        ... pc,
        { op: 'i32.const', value: 4 },
        { op: 'i32.add' },
        { op: 'i32.add' },
        ... write(REGS.PC),
        ... escape()
    ];
}
BGEZAL.assembly = (pc, rs, simm16) => `bgezal\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

function SYSCALL(pc, delayed) {
    return exception(Consts.Exceptions.SysCall, pc, delayed);
}
SYSCALL.assembly = (imm20) => `syscall\t$${imm20.toString(16)}`;

function BREAK(pc, delayed) {
    return exception(Consts.Exceptions.Breakpoint, pc, delayed);
}
BREAK.assembly = (imm20) => `break\t$${imm20.toString(16)}`;

export default {
    field: "opcode",
    fallback: ReservedInstruction,
    0x00: {
        field: "funct",
        0x00: SLL,
        0x02: SRL,
        0x03: SRA,
        0x04: SLLV,
        0x06: SRLV,
        0x07: SRAV,
        0x08: JR,
        0x09: JALR,
        0x0C: SYSCALL,
        0x0D: BREAK,
        0x10: MFHI,
        0x11: MTHI,
        0x12: MFLO,
        0x13: MTLO,
        0x18: MULT,
        0x19: MULTU,
        0x1A: DIV,
        0x1B: DIVU,
        0x20: ADD,
        0x21: ADDU,
        0x22: SUB,
        0x23: SUBU,
        0x24: AND,
        0x25: OR,
        0x26: XOR,
        0x27: NOR,
        0x2A: SLT,
        0x2B: SLTU
    },
    0x01: {
        field: "rt",
        0x00: BLTZ,
        0x01: BGEZ,
        0x10: BLTZAL,
        0x11: BGEZAL
    },
    0x02: J,
    0x03: JAL,
    0x04: BEQ,
    0x05: BNE,
    0x06: BLEZ,
    0x07: BGTZ,
    0x08: ADDI,
    0x09: ADDIU,
    0x0A: SLTI,
    0x0B: SLTIU,
    0x0C: ANDI,
    0x0D: ORI,
    0x0E: XORI,
    0x0F: LUI,
    0x10: COP0.default,
    0x11: CopUnusable,
    0x13: CopUnusable,
    0x13: CopUnusable,
    0x20: LB,
    0x21: LH,
    0x22: LWL,
    0x23: LW,
    0x24: LBU,
    0x25: LHU,
    0x26: LWR,
    0x28: SB,
    0x29: SH,
    0x2A: SWL,
    0x2B: SW,
    0x2E: SWR,
    0x30: COP0.LWC0,
    0x31: CopUnusable,
    0x13: CopUnusable,
    0x33: CopUnusable,
    0x38: COP0.SWC0,
    0x39: CopUnusable,
    0x13: CopUnusable,
    0x3B: CopUnusable
};
