const recast = require("recast");

function walk(AST, cb, parent = null) {
	if (Array.isArray(AST)) {
		AST.forEach((ast) => walk(ast, cb, parent));
		return ;
	}

	if (!AST || !AST.type || typeof AST !== 'object' || cb(AST, parent) === false) {
		return ;
	}

	Object.keys(AST).forEach((k) => walk(AST[k], cb, AST))
}

function template(node, fields) {
	function isField(node) {
		if (node.type === "Identifier" && fields.indexOf(node.name) >= 0) {
			return true;
		}

		return false;
	}

	function safe(node) {
		var isSafe = true;

		walk(node, (node) => {
			switch (node.type) {
			case "Identifier":
				if (fields.indexOf(node.name) < 0)
					isSafe = false;
				break ;
			case "MemberExpression":
				// Ignore the constants module (THIS IS A HACK AND I HATE IT)
				while (node.object.type === "MemberExpression") {
					node = node.object;
				}
				if (node.object.type === "Identifier" && node.object.name === "Consts") {
					return false;
				}
			case "Literal":
			case "SequenceExpression":
			case "ConditionalExpression":
			case "UnaryExpression":
			case "LogicalExpression":
			case "BinaryExpression":
			case "CallExpression":
				break ;
			default:
				isSafe = false;
				break ;
			}
			return isSafe;
		});

		return isSafe;
	}

	function generate(node) {
		if (node === null) {
			return "";
		}

		if (Array.isArray(node)) {
			return node.map((node) => generate(node)).join(" ");
		}

		if (safe(node)) {
			return `', ${recast.print(node).code}, '`;
		}

		switch (node.type) {
		// Atomic statements
		case "Literal":
			return JSON.stringify(node.value);
		case "Identifier":
			return isField(node) ? `', ${node.name}, '` : node.name;
		case "ThisExpression":
			return "that";

		// Declarations
		case "VariableDeclaration":
			return `let ${node.declarations.map(generate).join(", ")};`;
		case "VariableDeclarator":
			return `${generate(node.id)} = ${generate(node.init)}`

		// Functional Statements
		case "LabeledStatement":
			return `${generate(node.label)}: ${generate(node.body)};`;
		case "ThrowStatement":
			return `throw ${generate(node.argument)};`;
		case "BreakStatement":
			return `break ${node.label ? generate(node.label) : ""};`;
		case "ContinueStatement":
			return `continue ${node.label ? generate(node.label) : ""};`;
		case "DebuggerStatement":
			return "debugger";
		case "EmptyStatement":
			return "";
		case "ReturnStatement":
			return `that.pc = ${generate(node.argument)}; continue ;`;
		case "ExpressionStatement":
			return `${generate(node.expression)};`;
		case "BlockStatement":
			return (node.body.length > 1) ? `{ ${generate(node.body)} }` : generate(node.body);
		case "IfStatement":
			if (safe(node.test)) {
				const alt = node.alternate ? template(node.alternate, fields) : '""';
				return `', (${recast.print(node.test).code}) ? ${template(node.consequent, fields)} : ${alt}, '`;
			} else {
				if (node.alternate) {
					return `if (${generate(node.test)}) { ${generate(node.consequent)} } else ${generate(node.alternate)}`;
				} else {
					return `if (${generate(node.test)}) { ${generate(node.consequent)} }`;
				}
			}
		case "ForStatement":
			return `for (${generate(node.init)};${generate(node.test)};${generate(node.update)}) { ${generate(node.body)} }`;
		case "DoWhileStatement":
			return `do { ${generate(node.body)} } while (${generate(node.test)})`;
		case "WhileStatement":
			return `while (${generate(node.test)}) { ${generate(node.body)} }`;

		case "SwitchStatement":
			return `switch (${generate(node.discriminant)}) { ${node.cases.map(generate).join("\n")}}`
		case "SwitchCase":
			if (node.test) {
				return `case ${generate(node.test)}: ${generate(node.consequent)}`;
			} else {
				return `default: ${generate(node.consequent)}`;
			}

		case "TryStatement":
			return `try ${generate(node.block)} ${generate(node.handler)} ${node.finalizer ? `finally ${generate(node.finalizer)}` : ""}`
		case "CatchClause":
			return `catch (${generate(node.param)}) ${generate(node.body)}`


		// Functional Expressions
		case "NewExpression":
			return `new ${generate(node.callee)}(${node.arguments.map(generate).join(", ")})`;
		case "SequenceExpression":
			return node.expressions.map(generate).join(", ");
		case "ObjectExpression":
			return `{${node.properties.map(generate).join(", ")}}`
		case "Property":
			if (node.computed) {
				throw new Error("I don't recognize this syntax just yet")
			} else {
				return `${generate(node.key)}: ${generate(node.value)}`;
			}
		case "ArrayExpression":
			return `[${node.elements.map(generate).join(", ")}]`;
		case "ConditionalExpression":
			if (safe(node.test)) {
				return `', (${recast.print(node.test).code}) ? ${template(node.consequent, fields)} : ${template(node.alternate, fields)}, '`;
			} else {
				return `${generate(node.test)} ? ${generate(node.consequent)} : ${generate(node.alternate)}`;
			}
		case "MemberExpression":
			if (node.computed) {
				return `${generate(node.object)}[${generate(node.property)}]`;
			} else {
				return `${generate(node.object)}.${generate(node.property)}`;
			}
		case "UpdateExpression":
			if (node.prefix) {
				return `(${node.operator}${generate(node.argument)})`;
			} else {
				return `(${generate(node.argument)}${node.operator})`;
			}

		case "UnaryExpression":
			return `(${node.operator}${generate(node.argument)})`;
		case "LogicalExpression":
		case "AssignmentExpression":
		case "BinaryExpression":
			return `(${generate(node.left)} ${node.operator} ${generate(node.right)})`;
		case "CallExpression":
			return `${generate(node.callee)}(${node.arguments.map(generate).join(", ")})`;
		default:
			throw new Error(`Cannot handle expression: ${node.type}`);
		}
	}

	return `['${generate(node)}'].join("")`;
}

function terminates(ast) {
	var terminates = false;

	walk(ast, (node) => {
		switch (node.type) {
			case "SwitchStatement":
			case "IfStatement":
				return false;
			case "ReturnStatement":
				terminates = true;
		}

		return !terminates;
	});

	return terminates;
}

module.exports = function (content) {
	const tree = recast.parse(content);
	const extra = [];

	walk(tree, (node, parent) => {
		if (node.type !== "FunctionDeclaration" || parent.type !== "Program") return ;

		const fields = node.params.map((v) => v.name);

		extra.push(`${node.id.name}.fields = ${JSON.stringify(fields)}`);
		extra.push(`${node.id.name}.template = function (${fields.join(", ")}) { return ${template(node.body, fields)}; }`);
		extra.push(`${node.id.name}.terminates = ${terminates(node.body)};`)

		return false;
	})

	return `${content}\n${extra.join(";\n")}`;
}
