const Exception = require("./exception").default;
const Consts = require("./consts");

/******
 ** Trap Instructions
 ******/

export function ReservedInstruction(pc, delayed) {
	throw new Exception(Consts.Exceptions.ReservedInstruction, pc, delayed);
}
ReservedInstruction.assembly = () => `Reserved instruction`;

export function CopUnusable(pc, delayed) {
	throw new Exception(Consts.Exceptions.CoprocessorUnusable, pc, delayed);
}
CopUnusable.assembly = () => `COP\tunusable`;

/******
 ** Load/Store instructions
 ******/

export function LB(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;
	let v = this.read(address);

	if (rt) {
		this.registers[rt] = v << (24 - 8 * (address & 3)) >> 24;
	}
}

export function LBU(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;
	let v = this.read(address);

	if (rt) {
		var bit = 8 * (address & 3);
		this.registers[rt] = (v >> bit) & 0xFF;
	}
}

export function LH(rt, rs, imm16, pc, delayed) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (address & 1) throw new Exception(Consts.Exceptions.AddressLoad, pc, delayed);
	let v = this.read(address);

	if (rt) {
		this.registers[rt] = (address & 2) ? (v >> 16) : (v << 16 >> 16);
	}
}

export function LHU(rt, rs, imm16, pc, delayed) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (address & 1) throw new Exception(Consts.Exceptions.AddressLoad, pc, delayed);
	let v = this.read(address);

	if (rt) {
		this.registers[rt] = (address & 2) ? (v >>> 16) : (v & 0xFFFF);
	}
}

export function LW(rt, rs, imm16, pc, delayed) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (address & 3) throw new Exception(Consts.Exceptions.AddressLoad, pc, delayed);
	let v = this.read(address);

	if (rt) {
		this.registers[rt] = v;
	}
}

export function SB(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	this.write(address, rt ? this.registers[rt] << (address & 3) : 0, 0xFF << (8 * (address & 3)));
}

export function SH(rt, rs, imm16, pc, delayed) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (address & 1) throw new Exception(Consts.Exceptions.AddressStore, pc, delayed);

	this.write(address, rt ? this.registers[rt] << (address & 2) : 0, 0xFFFF << (8 * (address & 3)));
}

export function SW(rt, rs, imm16, pc, delayed) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (address & 3) throw new Exception(Consts.Exceptions.AddressStore, pc, delayed);

	this.write(address, rt ? this.registers[rt] : 0, ~0);
}

export function LWR(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;
	var data = this.read(address);

	if (rt) {
		var bit = 8 * (address & 3);

		this.registers[rt] = (this.registers[rt] & ~(~0 >>> bit)) | (data >>> bit);
	}
}

export function LWL(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;
	var data = this.read(address);

	if (rt && (~address & 3)) {
		var bit = 8 * (address & 3) + 8;
		var mask = 0xFFFFFFFF >>> bit;

		this.registers[rt] = (this.registers[rt] & mask) | (data << (32 - bit));
	}
}

export function SWR(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;
	var bit = 8 * (address & 3);

	this.write(address, rt ? this.registers[rt] << bit : 0, ~0 << bit);
}

export function SWL(rt, rs, imm16) {
	var address = (rs ? this.registers[rs] : 0) + imm16;

	if (~address & 3) {
		var bit = 8 * (address & 3) + 8;
		this.write(address, rt ? this.registers[rt] >>> (32 - bit) : 0, ~(~0 << bit) >>> 0);
	}
}

/******
 ** Arithmatic instructions
 ******/

export function ADD(rd, rs, rt, pc, delayed) {
	let value = (rs ? this.signed_registers[rs] : 0) + (rt ? this.signed_registers[rt] : 0);

	if (value < -0x80000000 || value >= 0x80000000) {
		throw new Exception(Consts.Exceptions.Overflow, pc, delayed);
	}

	if (rd) {
		this.registers[rd] = value;
	}
}

export function ADDU(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = (rs ? this.signed_registers[rs] : 0) + (rt ? this.signed_registers[rt] : 0);
	}
}

export function SUB(rd, rs, rt, pc, delayed) {
	let value = (rs ? this.signed_registers[rs] : 0) - (rt ? this.signed_registers[rt] : 0);

	if (value < -0x80000000 || value >= 0x80000000) {
		throw new Exception(Consts.Exceptions.Overflow, pc, delayed);
	}

	if (rd) {
		this.registers[rd] = value;
	}
}

export function SUBU(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = (rs ? this.signed_registers[rs] : 0) - (rt ? this.signed_registers[rt] : 0);
	}
}

export function ADDI(rt, rs, simm16, pc, delayed) {
	let value = rs ? this.signed_registers[rs] + simm16 : simm16;

	if (value < -0x80000000 || value >= 0x80000000) {
		throw new Exception(Consts.Exceptions.Overflow, pc, delayed);
	}

	if (rt) {
		this.registers[rt] = value;
	}
}

export function ADDIU(rt, rs, simm16) {
	if (rt) {
		this.registers[rt] = rs ? this.signed_registers[rs] + simm16 : simm16;
	}
}

/******
 ** Comparison instructions
 ******/
export function SLT(rd, rs, rt) {
	if (rd != 0) {
		this.registers[rd] = (rs ? this.signed_registers[rs] : 0) < (rt ? this.signed_registers[rt] : 0) ? 1 : 0;
	}
}

export function SLTU(rd, rs, rt) {
	if (rd != 0) {
		this.registers[rd] = (rs ? this.registers[rs] : 0) < (rt ? this.registers[rt] : 0) ? 1 : 0;
	}
}

export function SLTI(rt, rs, simm16) {
	if (rt != 0) {
		this.registers[rt] = (rs ? this.signed_registers[rs] : 0) < simm16 ? 1 : 0;
	}
}

export function SLTIU(rt, rs, simm16) {
	if (rt != 0) {
		this.registers[rt] = (rs ? this.registers[rs] : 0) < (simm16 >>> 0) ? 1 : 0;
	}
}

/******
 ** Logical instructions
 ******/

export function AND(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) & (rs ? (this.registers[rs]) : 0);
	}
}

export function OR(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) | (rs ? (this.registers[rs]) : 0);
	}
}


export function XOR(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) ^ (rs ? (this.registers[rs]) : 0);
	}
}

export function NOR(rd, rs, rt) {
	if (rd) {
		this.registers[rd] = ~((rt ? this.registers[rt] : 0) | (rs ? (this.registers[rs]) : 0));
	}
}

export function ANDI(rt, rs, imm16) {
	if (rt) {
		this.registers[rt] = (rs ? (this.registers[rs]) : 0) & imm16;
	}
}

export function ORI(rt, rs, imm16) {
	if (rt) {
		this.registers[rt] = (rs ? (this.registers[rs]) : 0) | imm16;
	}
}

export function XORI(rt, rs, imm16) {
	if (rt) {
		this.registers[rt] = (rs ? (this.registers[rs]) : 0) ^ imm16;
	}
}

/******
 ** Shift instructions
 ******/

export function SLLV(rd, rt, rs) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) << (rs ? (this.registers[rs] & 0x1F) : 0);
	}
}

export function SRLV(rd, rt, rs) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) >>> (rs ? (this.registers[rs] & 0x1F) : 0);
	}
}

export function SRAV(rd, rt, rs) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) >> (rs ? (this.registers[rs] & 0x1F) : 0);
	}
}

export function SLL(rd, rt, shamt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) << shamt;
	}
}

export function SRL(rd, rt, shamt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) >>> shamt;
	}
}

export function SRA(rd, rt, shamt) {
	if (rd) {
		this.registers[rd] = (rt ? this.registers[rt] : 0) >> shamt;
	}
}

export function LUI(rt, imm16) {
	if (rt) {
		this.registers[rt] = imm16 << 16;
	}
}

/******
 ** Multiply/Divide instructions
 ******/

export function MULT(rs, rt) {
	let x = rs ? this.signed_registers[rs] : 0;
	let y = rt ? this.signed_registers[rt] : 0;

	let signed = (x < 0) != (y < 0);
	x = Math.abs(x);
	y = Math.abs(y);

	var xl = x & 0xFFFF;
	var yl = y & 0xFFFF;

	this.hi = (x * y) / 0x100000000 >>> 0;
	this.lo = (xl * yl) + (((x & 0xFFFF0000) >>> 0) * yl + ((y & 0xFFFF0000) >>> 0) * xl) >>> 0;

	if (signed) {
		if (this.lo) {
			this.lo = (1 + ~this.lo) >>> 0;
		} else {
			this.hi = (1 + ~this.hi) >>> 0;
		}
	}
}

export function MULTU(rs, rt) {
	let x = rs ? this.registers[rs] : 0;
	let y = rt ? this.registers[rt] : 0;

	var xl = x & 0xFFFF;
	var yl = y & 0xFFFF;

	this.hi = (x * y) / 0x100000000 >>> 0;
	this.lo = (xl * yl) + (((x & 0xFFFF0000) >>> 0) * yl + ((y & 0xFFFF0000) >>> 0) * xl) >>> 0;
}

export function DIV(rs, rt) {
	let s = rs ? this.signed_registers[rs] : 0;
	let t = rt ? this.signed_registers[rt] : 0;

	if (s == -0x80000000 && t == -1) {
		this.hi = 0x80000000;
		this.lo = 0;
	} else if (t == 0) {
		this.hi = s;
		this.lo = (s < 0) ? 1 : -1;
	} else {
		this.hi = (s % t) >>> 0; // NOTE: Sign may be incorrect
		this.lo = (s / t) >>> 0;
	}
}

export function DIVU(rs, rt) {
	let s = rs ? this.registers[rs] : 0;
	let t = rt ? this.registers[rt] : 0;

	if (t == 0) {
		this.hi = s;
		this.lo = ~0;
	} else {
		this.hi = (s % t);
		this.lo = (s / t) >>> 0;
	}
}

export function MFHI(rd) {
	if (rd) this.registers[rd] = this.hi;
}

export function MFLO(rd) {
	if (rd) this.registers[rd] = this.lo;
}

export function MTHI(rs) {
	this.hi = rs ? this.registers[rs] : 0;
}

export function MTLO(rs) {
	this.lo = rs ? this.registers[rs] : 0;
}

/******
 ** Branching instructions
 ******/

export function J (pc, imm26, delay) {
	delay(pc);
	return ((pc & 0xF0000000) | (imm26 * 4)) >>> 0;
}

export function JAL (pc, imm26, delay) {
	delay(pc);
	this.registers[31] = pc + 8;
	return ((pc & 0xF0000000) | (imm26 * 4)) >>> 0;
}

export function JR(rs, pc, delay) {
	delay(pc);
	return (rs ? this.registers[rs] & ~3: 0);
}

export function JALR(rs, rd, pc, delay) {
	delay(pc);
	if (rd) {
		this.registers[rd] = pc + 8;
	}

	return (rs ? this.registers[rs] & ~3 : 0);
}

export function BEQ(pc, rs, rt, simm16, delay) {
	if ((rs ? this.signed_registers[rs] : 0) === (rt ? this.signed_registers[rt] : 0)) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BNE(pc, rs, rt, simm16, delay) {
	if ((rs ? this.signed_registers[rs] : 0) !== (rt ? this.signed_registers[rt] : 0)) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BLTZ(pc, rs, simm16, delay) {
	if (((rs == 0) ? 0 : this.signed_registers[rs]) < 0) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BGEZ(pc, rs, simm16, delay) {
	if (((rs == 0) ? 0 : this.signed_registers[rs]) >= 0) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BGTZ(pc, rs, simm16, delay) {
	if ((rs ? this.signed_registers[rs] : 0) > 0) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BLEZ(pc, rs, simm16, delay) {
	if (((rs == 0) ? 0 : this.signed_registers[rs]) <= 0) {
		delay(pc);
		return (pc + 4) + (simm16 * 4);
	}
}

export function BLTZAL(pc, rs, simm16, delay) {
	if (0 > ((rs == 0) ? 0 : this.signed_registers[rs])) {
		delay(pc);
		this.registers[31] = pc + 8;
		return (pc + 4) + (simm16 * 4);
	}
}

export function BGEZAL(pc, rs, simm16, delay) {
	if (0 <= ((rs == 0) ? 0 : this.signed_registers[rs])) {
		delay(pc);
		this.registers[31] = pc + 8;
		return (pc + 4) + (simm16 * 4);
	}
}

export function SYSCALL(pc, delayed) {
	throw new Exception(Consts.Exceptions.SysCall, pc, delayed);
}

export function BREAK(pc, delayed) {
	throw new Exception(Consts.Exceptions.Breakpoint, pc, delayed);
}

/******
 ** Instruction disassembler templates
 ******/

LB.assembly = (rs, rt, imm16) => `lb\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LBU.assembly = (rs, rt, imm16) => `lbu\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LH.assembly = (rs, rt, imm16) => `lh\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LHU.assembly = (rs, rt, imm16) => `lhu\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LW.assembly = (rs, rt, imm16) => `lw\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LWR.assembly = (rs, rt, imm16) => `lwr\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
LWL.assembly = (rs, rt, imm16) => `lwl\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
SB.assembly = (rs, rt, imm16) => `sb\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
SH.assembly = (rs, rt, imm16) => `sh\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
SW.assembly = (rs, rt, imm16) => `sw\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
SWL.assembly = (rs, rt, imm16) => `swl\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`
SWR.assembly = (rs, rt, imm16) => `swr\t${Consts.Registers[rt]}, ${imm16}(${Consts.Registers[rs]})`

ADD.assembly = (rd, rs, rt) => rd ? `add\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
ADDU.assembly = (rd, rs, rt) => rd ? `addu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
SUB.assembly = (rd, rs, rt) => rd ? `sub\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
SUBU.assembly = (rd, rs, rt) => rd ? `subu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
ADDI.assembly = (rt, rs, simm16) => rt ? `addi\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}` : "nop";
ADDIU.assembly = (rt, rs, simm16) => rt ? `addiu\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}` : "nop";

SLT.assembly = (rd, rs, rt) => `slt\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
SLTU.assembly = (rd, rs, rt) => `sltu\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
SLTI.assembly = (rt, rs, simm16) => `slti\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, ${simm16}`;
SLTIU.assembly = (rt, rs, simm16) => `sltiu\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${(simm16 >>> 0).toString(16)}`;

AND.assembly = (rd, rs, rt) => rd ? `and\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
OR.assembly = (rd, rs, rt) => rd ? `or\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
XOR.assembly = (rd, rs, rt) => rd ? `xor\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
NOR.assembly = (rd, rs, rt) => rd ? `nor\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
ANDI.assembly = (rt, rs, imm16) => rt ? `andi\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";
ORI.assembly = (rt, rs, imm16) => rt ? `ori\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";
XORI.assembly = (rt, rs, imm16) => rt ? `xori\t${Consts.Registers[rt]}, ${Consts.Registers[rs]}, $${imm16.toString(16)}` : "nop";

SLLV.assembly = (rd, rt, rs) => rd ? `sllv\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
SRLV.assembly = (rd, rt, rs) => rd ? `srlv\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
SRAV.assembly = (rd, rt, rs) => rd ? `srav\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}, ${Consts.Registers[rt]}` : "nop";
SLL.assembly = (rd, rt, shamt) => rd ? `sll\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";
SRL.assembly = (rd, rt, shamt) => rd ? `srl\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";
SRA.assembly = (rd, rt, shamt) => rd ? `sra\t${Consts.Registers[rd]}, ${Consts.Registers[rt]}, ${shamt}` : "nop";
LUI.assembly = (rt, imm16) => `lui\t${Consts.Registers[rt]}, $${imm16.toString(16)}`;

MULT.assembly = (rs, rt) => `mult\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
MULTU.assembly = (rs, rt) => `multu\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
DIV.assembly = (rs, rt) => `div\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
DIVU.assembly = (rs, rt) => `divu\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}`;
MFHI.assembly = (rd) => `mfhi\t${Consts.Registers[rd]}`;
MFLO.assembly = (rd) => `mflo\t${Consts.Registers[rd]}`;
MTHI.assembly = (rs) => `mthi\t${Consts.Registers[rs]}`;
MTLO.assembly = (rs) => `mtlo\t${Consts.Registers[rs]}`;

J.assembly = (pc, imm26) => `j\t$${(((pc & 0xF0000000) | (imm26 * 4)) >>> 0).toString(16)}`;
JAL.assembly = (pc, imm26) => `jal\t$${(((pc & 0xF0000000) | (imm26 * 4)) >>> 0).toString(16)}`;
JR.assembly = (rs) => `jr\t${Consts.Registers[rs]}`;
JALR.assembly = (rs, rd) => `jalr\t${Consts.Registers[rd]}, ${Consts.Registers[rs]}`;
BEQ.assembly = (pc, rs, rt, simm16) => `beq\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BNE.assembly = (pc, rs, rt, simm16) => `bne\t${Consts.Registers[rs]}, ${Consts.Registers[rt]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BLTZ.assembly = (pc, rs, simm16) => `bltz\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BGEZ.assembly = (pc, rs, simm16) => `bgez\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BGTZ.assembly = (pc, rs, simm16) => `bgtz\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BLEZ.assembly = (pc, rs, simm16) => `blez\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BLTZAL.assembly = (pc, rs, simm16) => `bltzal\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;
BGEZAL.assembly = (pc, rs, simm16) => `bgezal\t${Consts.Registers[rs]}, $${((pc + 4) + (simm16 * 4)).toString(16)}`;

SYSCALL.assembly = (imm20) => `syscall\t$${imm20.toString(16)}`;
BREAK.assembly = (imm20) => `break\t$${imm20.toString(16)}`;
