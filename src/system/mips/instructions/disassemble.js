import * as Consts from "../consts";

const Disassembly = {
    ReservedInstruction: (fields, pc) => `---`,
    CopUnusable: (fields, pc) => `COP${fields.cop}\tunusable`,

    LB: (fields, pc) => `lb\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    LBU: (fields, pc) => `lbu\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    LH: (fields, pc) => `lh\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    LHU: (fields, pc) => `lhu\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    LW: (fields, pc) => `lw\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SB: (fields, pc) => `sb\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SH: (fields, pc) => `sh\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SW: (fields, pc) => `sw\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,

    LWR: (fields, pc) => `lwr\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    LWL: (fields, pc) => `lwl\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SWR: (fields, pc) => `swr\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SWL: (fields, pc) => `swl\t${Consts.Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,

    ADD: (fields, pc) => fields.rd ? `add\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    ADDU: (fields, pc) => fields.rd ? `addu\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    SUB: (fields, pc) => fields.rd ? `sub\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    SUBU: (fields, pc) => fields.rd ? `subu\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    ADDI: (fields, pc) => fields.rt ? `addi\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, ${fields.simm16}` : "nop",
    ADDIU: (fields, pc) => fields.rt ? `addiu\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, ${fields.simm16}` : "nop",

    SLT: (fields, pc) => `slt\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    SLTU: (fields, pc) => `sltu\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    SLTI: (fields, pc) => `slti\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, ${fields.simm16}`,
    SLTIU: (fields, pc) => `sltiu\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, $${(fields.simm16 >>> 0).toString(16)}`,

    AND: (fields, pc) => fields.rd ? `and\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    OR: (fields, pc) => fields.rd ? `or\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    XOR: (fields, pc) => fields.rd ? `xor\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    NOR: (fields, pc) => fields.rd ? `nor\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    ANDI: (fields, pc) => fields.rt ? `andi\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, $${fields.imm16.toString(16)}` : "nop",
    ORI: (fields, pc) => fields.rt ? `ori\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, $${fields.imm16.toString(16)}` : "nop",
    XORI: (fields, pc) => fields.rt ? `xori\t${Consts.Registers[fields.rt]}, ${Consts.Registers[fields.rs]}, $${fields.imm16.toString(16)}` : "nop",

    SLLV: (fields, pc) => fields.rd ? `sllv\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    SRLV: (fields, pc) => fields.rd ? `srlv\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    SRAV: (fields, pc) => fields.rd ? `srav\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}` : "nop",
    SLL: (fields, pc) => fields.rd ? `sll\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rt]}, ${fields.shamt}` : "nop",
    SRL: (fields, pc) => fields.rd ? `srl\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rt]}, ${fields.shamt}` : "nop",
    SRA: (fields, pc) => fields.rd ? `sra\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rt]}, ${fields.shamt}` : "nop",
    LUI: (fields, pc) => `lui\t${Consts.Registers[fields.rt]}, $${fields.imm16.toString(16)}`,

    MULT: (fields, pc) => `mult\t${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    MULTU: (fields, pc) => `multu\t${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    DIV: (fields, pc) => `div\t${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    DIVU: (fields, pc) => `divu\t${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}`,
    MFHI: (fields, pc) => `mfhi\t${Consts.Registers[fields.rd]}`,
    MFLO: (fields, pc) => `mflo\t${Consts.Registers[fields.rd]}`,
    MTHI: (fields, pc) => `mthi\t${Consts.Registers[fields.rs]}`,
    MTLO: (fields, pc) => `mtlo\t${Consts.Registers[fields.rs]}`,

    J: (fields, pc) => `j\t$${(((pc & 0xF0000000) | (fields.imm26 * 4)) >>> 0).toString(16)}`,
    JAL: (fields, pc) => `jal\t$${(((pc & 0xF0000000) | (fields.imm26 * 4)) >>> 0).toString(16)}`,
    JR: (fields, pc) => `jr\t${Consts.Registers[fields.rs]}`,
    JALR: (fields, pc) => `jalr\t${Consts.Registers[fields.rd]}, ${Consts.Registers[fields.rs]}`,
    BEQ: (fields, pc) => `beq\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BNE: (fields, pc) => `bne\t${Consts.Registers[fields.rs]}, ${Consts.Registers[fields.rt]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BLTZ: (fields, pc) => `bltz\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BGEZ: (fields, pc) => `bgez\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BGTZ: (fields, pc) => `bgtz\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BLEZ: (fields, pc) => `blez\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BLTZAL: (fields, pc) => `bltzal\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,
    BGEZAL: (fields, pc) => `bgezal\t${Consts.Registers[fields.rs]}, $${((pc + 4) + (fields.simm16 * 4)).toString(16)}`,

    SYSCALL: (fields, pc) => `syscall\t$${fields.imm20.toString(16)}`,
    BREAK: (fields, pc) => `break\t$${fields.imm20.toString(16)}`,

    MFC0: (fields, pc) => `mfc0\t${Consts.Registers[fields.rt]}, ${Consts.COP0Registers[fields.rd]}`,
    MTC0: (fields, pc) => `mtc0\t${Consts.Registers[fields.rt]}, ${Consts.COP0Registers[fields.rd]}`,
    RFE: (fields, pc) => `cop0\trte`,
    TLBR: (fields, pc) => `cop0\ttlbr`,
    TLBWI: (fields, pc) => `cop0\ttlbwi`,
    TLBWR: (fields, pc) => `cop0\ttlbwr`,
    TLBP: (fields, pc) => `cop0\ttlbp`,
    CFC0: (fields, pc) => `cfc0\t${Consts.Registers[fields.rt]}, cop0cnt${fields.rd}`,
    CTC0: (fields, pc) => `ctc0\t${Consts.Registers[fields.rt]}, cop0cnt${fields.rd}`,
    LWC0: (fields, pc) => `lwc0\t${Consts.COP0Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`,
    SWC0: (fields, pc) => `swc0\t${Consts.COP0Registers[fields.rt]}, ${fields.imm16}(${Consts.Registers[fields.rs]})`
}

export default Disassembly;
