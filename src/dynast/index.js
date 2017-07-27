import decode from "./import";
import encode from "./export";

import raw from "raw-loader!./standard.dyn";
import { parser } from "./dynast.jison"

export function process(source) {
	const program = parser.parse(source);

	if (program.type !== 'Program') {
		throw new Error("This is not a valid program");
	}

	program.body.forEach(_processStatement);
}

function _processStatement(node) {
	switch (node.type) {
	case 'ExportStatement':
		break ;
	case 'EntityStatement':
		break ;
	default:
		console.log(JSON.stringify(node, null, 4))
		throw new Error(`Cannot process statement ${node.type}`)
	}
}

try {
	console.log(process(raw));
} catch(e) {
	console.log(e.message);
}
