import { parse } from "./dynast";
import decode from "./import";
import encode from "./export";

import raw from "raw-loader!../system/mips/instructions/instructions.dyn";
import { parser } from "./dynast.jison"


try {
	console.log(parser.parse(raw));
} catch(e) {
	console.log(e.message)
}
/*
const ast = parse(raw);
console.log(JSON.stringify(ast, null, 4))
*/
