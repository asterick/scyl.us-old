import sys
from struct import unpack

for fn in sys.argv[1:]:
	bytes = open(fn, "rb").read()

	words = unpack("<%iI" % (len(bytes) / 4), bytes)
	print ', '.join([str(c) for c in words]) + ", "

