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

def output_jsfields(target, masked):
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

	target.write("import { Registers, Conditions, ShiftType, MSRFields } from './disassemble';\n\nexport function get_fields(name, word) {\n    switch(name) {")
	for call in masked:
		# Format / break out fields
		mapped_fields = []
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
				format = "'%(name)s': " + remap_field[(name, shift, mask)]
			elif name in remap_field:
				format = "%(name)s: " + remap_field[name]
			else:
				format = "%(name)s: %(unsigned)s"

			mapped_fields += [format % fields]

		target.write("        case '%s': return { %s };\n" % (call['name'], ', '.join(mapped_fields)))

	target.write("    }\n}\n")

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
parser.add_argument('--jsfields', help='generate JS fields for disassembling')
parser.add_argument('--cstub', help='generate C functions for execution')

args = parser.parse_args()

masked = [to_fields(line[::-1]) for line in parse(args.TSVs)]
tree = make_tree(masked)


if args.table:
	with open(args.table, "w") as target:
		output_stubs(target, masked)
		output_tree(target, tree)

if args.jsfields:
	with open(args.jsfields, "w") as target:
		output_jsfields(target, masked)

if args.cstub:
	with open(args.cstub, "w") as target:
		output_cstub(target, masked)

