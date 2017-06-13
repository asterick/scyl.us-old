import decode from "./import";
import encode from "./export";

export default function (array) {
	var ast = decode(array);
	var result = encode(ast);

	var a = new Uint8Array(array);
	var b = new Uint8Array(result);

	try {
		a.forEach((v, i) => { if (v != b[i]) throw i; });
	} catch (i) {
		console.log(a);
		console.log(b);
		console.error(i, b.length, a.length)
	}
}
