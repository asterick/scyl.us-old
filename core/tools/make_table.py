import csv
from sys import argv

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

	print "EXPORT void %s(uint32_t address, uint32_t word);" % (name)
	print "PREPARE_INSTRUCTION(%s);" % name

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

	# calculate mask
	on_mask, off_mask = 0, 0

	for row in sets:
		on_mask |= (row['fixed'] & row['mask']) 
		off_mask |= (~row['fixed'] & row['mask'])

	mask = on_mask & off_mask

	if mask == 0:
		return "Mask Exception"

	shift = max(0, top_bit(mask) - TABLE_INDEX_BITS + 1)
	index_mask, increment = ((1 << TABLE_INDEX_BITS) - 1) << shift, 1 << shift

	# divide rows into bit buckets
	entries = []
	for i in range(0, index_mask+increment, increment):
		bucket = []
		
		for k, row in enumerate(sets):
			if (row['fixed'] & index_mask) != i:
				continue
			bucket += [row]

		entries += [make_tree(bucket)]

	return { 'type': 'group', 'shift': shift, 'mask': index_mask, 'entries': entries }

global tree_index
tree_index = 0
def output_tree(tree, name="root_table"):
	if tree == None:
		return "        UNKNOWN_OP,"
	elif tree['type'] == 'group':
		global tree_index

		tree_index += 1
		children = [output_tree(element, "sub_tree_%i" % tree_index) for element in tree['entries']]

		print "static const InstructionTable %s = {" % name
		print "    ENTRY_TABLE, %i, {" % tree['shift']
		
		for child in children:
			print child

		print "    }"
		print "};"
		print

		return "        &%s," % name
	elif tree['type'] == 'instruction':
		return "        INSTRUCTION(%s)," % tree['name']


with open(argv[1]) as tsv:
	all_lines = [line[::-1] for line in csv.reader(tsv, dialect="excel-tab") if line[0]] [1:]

	masked = [to_fields(line) for line in all_lines]
	tree = make_tree(masked)

	output_tree(tree)
