from struct import unpack
import sys

output, files = sys.argv[1], sys.argv[2:]

with open(output, "w") as fo:
	for f in files:
		fo.write("// %s\n" % f)
		with open(f, "rb") as fi:
			data = fi.read()
			words = unpack("<%iI" % (len(data) / 4), data)

			fo.write("%s,\n" % ', '.join([hex(w) for w in words]))

