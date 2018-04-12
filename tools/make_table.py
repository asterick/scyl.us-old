import argparse
import csv

TABLE_INDEX_BITS = 4

def top_bit(mask):
	return len(bin(mask)[2:]) - 1

def to_fields(line):
	fields 	= {}
	count 	= 0
	mask 	= 0
	fixed   = 0
	name, arg = line[-1], line[-2]
	if arg:
		name = "%s_%s" % (name, arg)

	for bit, element in enumerate(line[:-2]):
		if not element:
			count += 1
		elif element in ['0', '1']:
			mask 	|= 1 << bit
			fixed	|= int(element) << bit
		else:
			field_mask = ((2 << count) - 1) << (bit - count)
			fields[element] = (bit - count, field_mask)
			count = 0

	return { 'name': name, 'type': 'instruction', 'fields': fields, 'mask': mask, 'fixed': fixed }

def make_tree(sets):
	# edge cases
	if len(sets) == 0:
		return None
	elif len(sets) == 1:
		return sets[0]

	# calculate sortable bits
	on_mask, off_mask = 0, 0

	for row in sets:
		on_mask |= (row['fixed'] & row['mask']) 
		off_mask |= (~row['fixed'] & row['mask'])

	mask = on_mask & off_mask

	if mask == 0:
		for s in sets:
			print bin(row['mask'] | 0x100000000), bin(row['fixed'] | 0x100000000), s['name'], s
		raise Exception("Mask Exception")

	shift = max(0, top_bit(mask) - 3)
	index_mask, increment = 0xF << shift, 1 << shift

	# divide rows into bit buckets
	entries = []

	for i in range(0, index_mask+increment, increment):
		bucket = []
		
		for k, row in enumerate(sets):
			if (row['fixed'] & index_mask) != (i & row['mask']):
				continue
			bucket += [row]

		entries += [make_tree(bucket)]

	return { 'type': 'group', 'shift': shift, 'mask': index_mask, 'entries': entries }

def output_stubs(target, masked):
	for s in masked:
		name = s['name']
		target.write("EXPORT void %s(uint32_t address, uint32_t word);\n" % (name))
		target.write("PREPARE_INSTRUCTION(%s);\n" % name)

global tree_index
tree_index = 0
def output_tree(target, tree, name="root_table"):
	if tree == None:
		return "        UNKNOWN_OP,"
	elif tree['type'] == 'group':
		global tree_index

		tree_index += 1
		children = [output_tree(target, element, "sub_tree_%i" % tree_index) for element in tree['entries']]

		target.write("static const InstructionTable %s = {\n" % name)
		target.write("    ENTRY_TABLE, %i, {\n" % tree['shift'])
		
		target.write("%s\n" % '\n'.join(children))

		target.write("    }\n")
		target.write("};\n")
		target.write("\n")

		return "        &%s," % name
	elif tree['type'] == 'instruction':
		return "        INSTRUCTION(%s)," % tree['name']

def output_jsstub(target, masked):
	remap_field = {
		(  'cond', 28, 0xf0000000): 'Conditions[ (word & 0x%(mask)x) >>> %(shift)i ]',
		(   'imm',  0, 0x00ffffff): '%(signed)s',
		('rotate',  8, 0x00000f00): '(%(unsigned)s) * 2',
		(     'S', 20, 0x00100000): '(%(unsigned)s) ? "s" : ""',
		'field_mask':				'MSRFields[%(unsigned)s]',
		'Rn':						'Registers[%(unsigned)s]',
		'Rd':						'Registers[%(unsigned)s]',
		'Rs':						'Registers[%(unsigned)s]',
		'Rm':						'Registers[%(unsigned)s]',
		'B':						'%(unsigned)s ? "b" : ""'
	}

	body = {
		'bx_reg': 		"`bx${cond}\t${Rn}`",
		'blx_reg': 		"`blx${cond}\t${Rm}`",
		'b_imm': 		"`b${cond}\t#0x${((imm << 2) + address + 8).toString(16)}`",
		'bl_imm': 		"`bl${cond}\t#0x${((imm << 2) + address + 8).toString(16)}`",
		'swi_imm':  	"`swi${cond}\t#0x#${imm}`",

		'and_rot_imm':	"`and${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'eor_rot_imm':	"`eor${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'sub_rot_imm':	"`sub${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'rsb_rot_imm':	"`rsb${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'add_rot_imm':	"`add${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'adc_rot_imm':	"`adc${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'sbc_rot_imm':	"`sbc${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'rsc_rot_imm':	"`rsc${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'tst_rot_imm':	"`tst${cond}${S}\t${Rn}, %(rot_imm)s`",
		'teq_rot_imm':	"`teq${cond}${S}\t${Rn}, %(rot_imm)s`",
		'cmp_rot_imm':	"`cmp${cond}${S}\t${Rn}, %(rot_imm)s`",
		'cmn_rot_imm':	"`cmn${cond}${S}\t${Rn}, %(rot_imm)s`",
		'orr_rot_imm':	"`orr${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'mov_rot_imm':	"`mov${cond}${S}\t${Rd}, %(rot_imm)s`",
		'bic_rot_imm':	"`bic${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",
		'mvn_rot_imm':	"`mvn${cond}${S}\t${Rd}, ${Rn}, %(rot_imm)s`",

		'and_shift_imm':	"`and${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'eor_shift_imm':	"`eor${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'sub_shift_imm':	"`sub${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'rsb_shift_imm':	"`rsb${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'add_shift_imm':	"`add${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'adc_shift_imm':	"`adc${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'sbc_shift_imm':	"`sbc${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'rsc_shift_imm':	"`rsc${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'tst_shift_imm':	"`tst${cond}${S}\t${Rn}, %(shift_imm)s`",
		'teq_shift_imm':	"`teq${cond}${S}\t${Rn}, %(shift_imm)s`",
		'cmp_shift_imm':	"`cmp${cond}${S}\t${Rn}, %(shift_imm)s`",
		'cmn_shift_imm':	"`cmn${cond}${S}\t${Rn}, %(shift_imm)s`",
		'orr_shift_imm':	"`orr${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'mov_shift_imm':	"`mov${cond}${S}\t${Rd}, %(shift_imm)s`",
		'bic_shift_imm':	"`bic${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",
		'mvn_shift_imm':	"`mvn${cond}${S}\t${Rd}, ${Rn}, %(shift_imm)s`",

		'and_shift_reg':	"`and${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'eor_shift_reg':	"`eor${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'sub_shift_reg':	"`sub${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'rsb_shift_reg':	"`rsb${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'add_shift_reg':	"`add${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'adc_shift_reg':	"`adc${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'sbc_shift_reg':	"`sbc${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'rsc_shift_reg':	"`rsc${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'tst_shift_reg':	"`tst${cond}${S}\t${Rn}, %(shift_reg)s`",
		'teq_shift_reg':	"`teq${cond}${S}\t${Rn}, %(shift_reg)s`",
		'cmp_shift_reg':	"`cmp${cond}${S}\t${Rn}, %(shift_reg)s`",
		'cmn_shift_reg':	"`cmn${cond}${S}\t${Rn}, %(shift_reg)s`",
		'orr_shift_reg':	"`orr${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'mov_shift_reg':	"`mov${cond}${S}\t${Rd}, %(shift_reg)s`",
		'bic_shift_reg':	"`bic${cond}${S}\t${Rd}, ${Rn}, %(shift_reg)s`",
		'mvn_shift_reg':	"`mvn${cond}${S}\t${Rd}, ${Rn},%(shift_reg)s`",

		'swp':				"`swp${cond}${S}\t${Rd}, ${Rm}, ${Rs}, ${Rn}`",
		'cswp':				"`cswp${cond}${S}\t${Rd}, ${Rm}, ${Rs}, ${Rn}`",
		'mul':				"`mul${cond}${S}\t${Rd}, ${Rm}, ${Rs}`",
		'mla':				"`mla${cond}${S}\t${Rd}, ${Rm}, ${Rs}, ${Rn}`",
		'umull':			"`umull${cond}${S}\t${RdLo}, ${RdHi}, ${Rm}, ${Rs}`",
		'umlal':			"`umlal${cond}${S}\t${RdLo}, ${RdHi}, ${Rm}, ${Rs}`",
		'smull':			"`smull${cond}${S}\t${RdLo}, ${RdHi}, ${Rm}, ${Rs}`",
		'smlal':			"`smlal${cond}${S}\t${RdLo}, ${RdHi}, ${Rm}, ${Rs}`",

		'str_post_imm':			"`str${cond}${B}\t${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`",
		'ldr_post_imm':			"`ldr${cond}${B}\t${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`",
		'strt_imm':				"`str${cond}${B}t\t${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`",
		'ldrt_imm':				"`ldr${cond}${B}t\t${Rd}, [${Rn}], #${U ? '' : '-'}${imm}`",
		'str_pre_imm':			"`str${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]`",
		'ldr_pre_imm':			"`ldr${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]`",
		'str_pre_wb_imm':		"`str${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]!`",
		'ldr_pre_wb_imm':		"`ldr${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}${imm}]!`",

		'str_post_shift_imm':	"`str${cond}${B}\t${Rd}, [${Rn}], #${U ? '' : '-'}%(shift_imm)s`",
		'ldr_post_shift_imm':	"`ldr${cond}${B}\t${Rd}, [${Rn}], #${U ? '' : '-'}%(shift_imm)s`",
		'strt_shift_imm':		"`str${cond}${B}t\t${Rd}, [${Rn}], #${U ? '' : '-'}%(shift_imm)s`",
		'ldrt_shift_imm':		"`ldr${cond}${B}t\t${Rd}, [${Rn}], #${U ? '' : '-'}%(shift_imm)s`",
		'str_pre_shift_imm':	"`str${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}%(shift_imm)s]`",
		'ldr_pre_shift_imm':	"`ldr${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}%(shift_imm)s]`",
		'str_pre_wb_shift_imm':	"`str${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}%(shift_imm)s]!`",
		'ldr_pre_wb_shift_imm':	"`ldr${cond}${B}\t${Rd}, [${Rn}, #${U ? '' : '-'}%(shift_imm)s]!`",

		'strh_post_reg':		"`strh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}${Rn}`",
		'ldrh_post_reg':		"`ldrh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}${Rn}`",
		'ldrsb_post_reg':		"`ldrsb${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}${Rn}`",
		'ldrsh_post_reg':		"`ldrsh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}${Rn}`",
		'strh_pre_reg':			"`strh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]`",
		'ldrh_pre_reg':			"`ldrh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]`",
		'ldrsb_pre_reg':		"`ldrsb${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]`",
		'ldrsh_pre_reg':		"`ldrsh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]`",
		'strh_pre_wb_reg':		"`strh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]!`",
		'ldrh_pre_wb_reg':		"`ldrh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]!`",
		'ldrsb_pre_wb_reg':		"`ldrsb${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]!`",
		'ldrsh_pre_wb_reg':		"`ldrsh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}${Rn}]!`",

		'strh_post_imm':		"`strh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}%(comp_imm)s`",
		'ldrh_post_imm':		"`ldrh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}%(comp_imm)s`",
		'ldrsb_post_imm':		"`ldrsb${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}%(comp_imm)s`",
		'ldrsh_post_imm':		"`ldrsh${cond}\t${Rd}, [${Rn}], ${U ? '' : '-'}%(comp_imm)s`",
		'strh_pre_imm':			"`strh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]`",
		'ldrh_pre_imm':			"`ldrh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]`",
		'ldrsb_pre_imm':		"`ldrsb${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]`",
		'ldrsh_pre_imm':		"`ldrsh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]`",
		'strh_pre_wb_imm':		"`strh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]!`",
		'ldrh_pre_wb_imm':		"`ldrh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]!`",
		'ldrsb_pre_wb_imm':		"`ldrsb${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]!`",
		'ldrsh_pre_wb_imm':		"`ldrsh${cond}\t${Rd}, [${Rn}, ${U ? '' : '-'}%(comp_imm)s]!`",

		'mrs':					"`mrs${cond}\t${Rd}, ${S ? 'spsr' : 'cspr'}`",
		'msr_reg':				"`msr${cond}\t${S ? 'spsr' : 'cspr'}_${field_mask}, ${Rm}`",
		'msr_rot_imm':			"`msr${cond}\t${S ? 'spsr' : 'cspr'}_${field_mask}, %(rot_imm)s`",
	}

	target.write("import { Registers, Conditions, ShiftType, MSRFields } from './table';\n\n")
	for call in masked:
		target.write("export function %s(word, address) {\n" % call['name'])

		# Format / break out fields
		for name, (shift, mask) in call['fields'].items():
			pre_shift = 31 - top_bit(mask)
			fields = { 
				'name': name, 
				'shift': shift, 
				'mask': mask, 
				'unsigned': "(word & 0x%x) >>> %i" % (mask, shift),
				'signed': "(word & 0x%x) << %i >> %i" % (mask, pre_shift, shift + pre_shift)
			}

			if (name, shift, mask) in remap_field:
				format = "    const %(name)s = " + remap_field[(name, shift, mask)] + ";\n"
			elif name in remap_field:
				format = "    const %(name)s = " + remap_field[name] + ";\n"
			else:
				format = "    const %(name)s = %(unsigned)s;\n"

			target.write(format % fields)

		# composite fields
		fields = {
			'rot_imm': 		"${(imm << rotate) | (imm >>> (32 - rotate))}",
			'shift_imm':	"${(typ || shift) ? `${Rm}, ${ShiftType[typ]} #${shift}` : Rm}",
			'shift_reg':	"${Rm}, ${ShiftType[typ]} ${Rs}",
			'comp_imm':		"#${(immH << 4) | immL}"
		}

		if call['name'] in body:
			formatted = body[call['name']] % fields

			target.write("\n    return %s;" % formatted)
		else:
			target.write("\n    return 'failed\\t%s';" % call['name'])
			print "%s is incomplete" % call['name']

		target.write("\n}\n\n")

def output_cstub(target, masked):
	target.write('#include <stdint.h>\n#include "compiler.h"\n\n')
	names = [call['name'] for call in masked] + ['undefined_op']

	for call in names:
		target.write("EXPORT void %s(uint32_t address, uint32_t word) {\n}\n\n" % call)

def parse(fns):
	for fn in fns:
		with open(fn) as tsv:
			for line in csv.reader(tsv, dialect="excel-tab"):
				if not line[0]:
					continue
				yield line

parser = argparse.ArgumentParser(description='Process opcode table')
parser.add_argument('TSVs', metavar='N', type=str, nargs='+',
                    help='input tables')
parser.add_argument('--table', help='generate C table for decoding instructions')
parser.add_argument('--jsstub', help='generate JS functions for disassembling')
parser.add_argument('--cstub', help='generate C functions for execution')

args = parser.parse_args()

masked = [to_fields(line[::-1]) for line in parse(args.TSVs)]
tree = make_tree(masked)


if args.table:
	with open(args.table, "w") as target:
		output_stubs(target, masked)
		output_tree(target, tree)

if args.jsstub:
	with open(args.jsstub, "w") as target:
		output_jsstub(target, masked)

if args.cstub:
	with open(args.cstub, "w") as target:
		output_cstub(target, masked)

