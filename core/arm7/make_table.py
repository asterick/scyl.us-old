import csv
from json import dumps

def top_bit(mask):
	return len(bin(mask)[2:]) - 1

def to_fields(line):
	fields 	= {}
	count 	= 0
	mask 	= 0
	fixed   = 0

	for bit, element in enumerate(line[:-1]):
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

	return { 'name': line[-1], 'type': 'instruction', 'fields': fields, 'mask': mask, 'fixed': fixed }

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

	shift = max(0, top_bit(mask) - 3)
	index_mask, increment = 0xF << shift, 1 << shift

	# divide rows into bit buckets
	entries = []
	for i in range(0, mask+1, increment):
		bucket = []
		
		for k, row in enumerate(sets):
			if (row['fixed'] & index_mask) != i:
				continue
			bucket += [row]

		entries += [make_tree(bucket)]

	return { 'type': 'group', 'shift': shift, 'mask': index_mask, 'entries': entries }


with open("opcodes.tsv") as tsv:
	all_lines = [line[::-1] for line in csv.reader(tsv, dialect="excel-tab")] [1:]

	masked = [to_fields(line) for line in all_lines]
	tree = make_tree(masked)

	print dumps(tree, sort_keys=True, indent=4)

	#lines = [ToFields(line[::-1]) for line in csv.reader(tsv, dialect="excel-tab")] [1:]
