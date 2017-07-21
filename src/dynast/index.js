import decode from "./import";
import encode from "./export";

import raw from "raw-loader!./standard.dyn";
import { parser } from "./dynast.jison"


try {
	const ast = parser.parse(raw);
	console.log(JSON.stringify(ast, null, 4));
} catch(e) {
	console.log(e.message)
}
