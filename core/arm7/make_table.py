import csv
from json import dumps

def lowest_bit(val):
	if not val:
		return -1

	b = 0
	while ~val & (1 << b):
		b += 1

	return b

def fix_mask(k):
	while k & (k + 1):
		k |= k >> 1
	return k

def to_fields(line):
	fields 	= {}
	count 	= 0
	mask 	= 0
	fixed   = 0

	for bit, element in enumerate(line):
		#print bit, element,

		if not element:
			count += 1
		elif element in ['0', '1']:
			mask 	|= 1 << bit
			fixed	|= int(element) << bit
		else:
			fields[element] = (bit - count, count + 1)
			count = 0

	return { 'type': 'instruction', 'fields': fields, 'mask': mask, 'fixed': fixed }

def make_tree(sets, base_mask = 0xFFFFFFFF):
	print sets
	# edge cases
	if len(sets) == 0:
		return None
	elif not base_mask:
		if len(sets) == 1:
			return sets[0]
		else:
			raise Exception("Mask volation")

	# calculate mask
	mask = base_mask
	for row in sets:
		mask &= row['mask']

	#print dumps(sets)

	lsb = lowest_bit(mask)
	index_mask = fix_mask(mask >> lsb)

	entries = [ [] for i in range(index_mask+1) ]

	for row in sets:
		index = (row['fixed'] >> lsb) & index_mask
		entries[index] += [row]

	entries = [make_tree(v, base_mask & ~(index_mask << lsb)) for v in entries]

	return { 'type': 'group', 'shift': lsb, 'mask': mask, 'entries': entries }


with open("opcodes.tsv") as tsv:
	all_lines = [line[::-1][:-1] for line in csv.reader(tsv, dialect="excel-tab")] [1:]

	masked = [to_fields(line) for line in all_lines]

	print make_tree(masked)

	#lines = [ToFields(line[::-1]) for line in csv.reader(tsv, dialect="excel-tab")] [1:]
