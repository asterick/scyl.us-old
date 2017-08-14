import re, sys

wast = sys.argv[1]

def remap(data):
	return ''.join(["\\\\%02x" % ord(ch) for ch in data])

res = '"%s"' % ''.join([remap(open(fn, "rb").read()) for fn in sys.argv[2:]])

rewritten = re.sub(r'"INSERT\!\!.*?"', res, open(wast, "r").read())
output = open(wast, "w").write(rewritten)
