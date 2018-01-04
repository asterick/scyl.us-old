export function hex(v) {
	v = v.toString(16);
	return "00000000".substr(v.length) + v;
}
