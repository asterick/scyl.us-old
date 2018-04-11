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
			if element == 'SBZ':
				mask |= field_mask
			elif element == 'SBO':
				mask |= field_mask
				fixed |= field_mask
			else:
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
	settings = {
		('cond', 28, 0xf0000000): 'Conditions[ (word & 0x%(mask)x) >>> %(shift)i ]',
		( 'imm',  0, 0x00ffffff): '%(signed)s'
	}

	body = {
		'bx_reg': 	"`bx${cond}  ${Registers[Rm]}`",
		'blx_reg': 	"`blx${cond} ${Registers[Rm]}`",
		'b_imm': 	"`b${cond}   ${((imm << 2) + address + 8).toString(16)}`",
		'bl_imm': 	"`bl${cond}  ${((imm << 2) + address + 8).toString(16)}`",
		'swi_imm':  "`swi${cond} #%(imm)i"
	}

	target.write("import { Registers, Conditions } from './consts';\n\n")
	for call in masked:
		target.write("export function %s(word, address) {\n" % call['name'])
		for name, (shift, mask) in call['fields'].items():
			pre_shift = 31 - top_bit(mask)
			fields = { 
				'name': name.replace("#", "Num"), 
				'shift': shift, 
				'mask': mask, 
				'unsigned': "(word & 0x%x) >>> %i" % (mask, shift),
				'signed': "(word & 0x%x) << %i >> %i" % (mask, pre_shift, shift + pre_shift)
			}

			if (name, shift, mask) in settings:
				format = "    const %(name)s = " + settings[(name, shift, mask)] + ";\n"
			else:
				format = "    const %(name)s = %(unsigned)s;\n"

			target.write(format % fields)

		if call['name'] in body:
			target.write("\n    return %s;" % body[call['name']])
		else:
			print "%s is incomplete" % call['name']

		target.write("\n}\n\n")

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
parser.add_argument('--jsstub', help='generate C table for decoding instructions')

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
