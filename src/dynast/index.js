import { parse } from "./dynast";
import decode from "./import";
import encode from "./export";

import raw from "raw-loader!../system/mips/instructions/instructions.dyn";
import { parser } from "./dynast.jison"


try {
	console.log(JSON.stringify(parser.parse(raw), null, 4));
} catch(e) {
	console.log(e.message)
}
/*
const ast = parse(raw);
console.log(ast, null, 4))
*/
