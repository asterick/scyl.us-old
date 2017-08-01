export function hex(v = 0) {
	v = v.toString(16);
	return "00000000".substr(v.length) + v;
}

export function fields(func) {
	return /\(?(.*?)\)?\s+\=\>/.exec(func)[1].split(/\s*,\s*/g);
}
