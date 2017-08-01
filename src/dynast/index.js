import Export from "./export";
import Import from "./import";

function j(y) {
	return JSON.stringify(y, null, 4);
}

fetch("test.wasm")
	.then((blob) => blob.arrayBuffer())
	.then((data) => {
		var decoded1 = Import(data);
		var encoded1 = Export(decoded1);
		var decoded2 = Import(encoded1);

		//console.log(j(decoded1), j(decoded2))
		console.log(JSON.stringify(decoded1, null, 4))
		console.log(JSON.stringify(decoded2, null, 4))
		console.log(j(decoded1) == j(decoded2))

		/*
		var a1 = new Uint8Array(data);
		var a2 = new Uint8Array(encoded1);

		for (var i = 0; i < a1.length; i++) {
			if (a1[i] !== a2[i]) throw new Error(`TEST FAILED ${i}`)
		}
		*/
	});
