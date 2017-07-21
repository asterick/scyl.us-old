import decode from "./import";
import encode from "./export";

import raw from "raw-loader!../system/mips/instructions/instructions.dyn";
import { parser } from "./dynast.jison"


try {
	const source = `
	export func inline + (a:u32, b:u32):u32 {
		asm
			= a, b	# Push A and B onto the stack
			i32.add
			;
	}

	export func inline : (a:u32):u64 {
		asm
			= a
			i64.extend_u/i32
			;
	}

	const smile:u32 = '😊'
	`;
	const ast = parser.parse(source);

	console.log(JSON.stringify(ast, null, 4));
} catch(e) {
	console.log(e.message)
}

/*
const ast = parse(raw);
console.log(ast, null, 4))
*/
