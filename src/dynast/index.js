import { parse } from "./dynast";
import decode from "./import";
import encode from "./export";

import raw from "raw-loader!../system/mips/instructions/instructions.dyn";

const ast = parse(raw);

console.log(JSON.stringify(ast, null, 4))
