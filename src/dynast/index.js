import decode from "./import";
import encode from "./export";

import raw from "raw-loader!../system/mips/instructions/instructions.dyn";
import { parser } from "./dynast.jison"


try {
	const source = `
	*😘[10][32] := '1'
	asm
		i64.reinterpret/f64
		{
			call(1, 2, 3)
		}
		= 0
		= 1
		= 2
		call.indirect
		if
			:(u32, u32):u32
			@SomeLabel
			else
		end
	;
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
