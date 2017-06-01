export function hex(v = 0) {
	v = v.toString(16);
	return "00000000".substr(v.length) + v;
}
