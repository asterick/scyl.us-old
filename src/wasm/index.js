import { decode, encode } from "./packer";

export default function (array) {
	var ast = decode(array);
	console.log(ast);
	var result = encode(ast);

	var a = new Uint8Array(array);
	var b = new Uint8Array(result);

	try {
		a.forEach((v, i) => { if (v != b[i]) throw i; });
	} catch (i) {
		//console.log(a);
		//console.log(b);
		console.error(i, b.length, a.length)
	}
}
