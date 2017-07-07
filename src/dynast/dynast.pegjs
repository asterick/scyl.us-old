Module
	= _ list:Definition*
		{ return list }

Definition
	= Imports
	/ Exports
	/ Label
	/ StructDeclaration
	/ FunctionDefinition
	/ VariableDefinition
	/ LoopStatement
	/ ReturnStatement
	/ TrapStatement
	/ NopStatement
	/ SeperationStatement
	/ BreakStatement
	/ Expression

Imports
	= Import decl:(FunctionDeclaration / VariableDeclaration / MemoryDeclaration)
		{ return { type: "Import", decl } }

Exports
	= Export decl:(FunctionDefinition / VariableDefinition / MemoryDeclaration)
		{ return { type: "Export", decl } }

StructDeclaration
	= type:StructType name:Identifier? "{" _ body:Variable* "}" _
		{ return { type, name, body } }

StructType
	= "struct" EC
		{ return "StructDeclaration" }
	/ "union" EC
		{ return "UnionDeclaration" }

CallDeclaration

	= "(" _ args:TypeList? ")" _ returns:ReturnList?
		{ return { type: "CallDeclaration", args, returns } }

FunctionDeclaration
	= "func" EC name:Identifier decl:CallDeclaration
		{ return { type: "FunctionDeclaration", decl } }

MemoryDeclaration
	= "memory" EC name:Identifier
		{ return { type: "MemoryDeclaration", name } }

VariableDeclaration
	= "def" EC decl:Variable
		{ return { type: "VariableDeclaration", decl } }
	/ "const" EC decl:Variable
		{ return { type: "VariableDeclaration", decl } }

FunctionDefinition
	= "func" EC name:Identifier "(" _ args:VariableList? ")" _ returns:ReturnList? body:Definition
		{ return { type: "FunctionDefinition", args, returns, body } }

VariableDefinition
	= decls:VariableDeclaration value:("=" _ v:Expression { return v })?
		{ return { type: "VariableDefinition", decls, value } }

/*****
 *** Statements
 *****/

LoopStatement
	= "loop" EC body:Definition
		{ return { type: "LoopStatement", body } }

ReturnStatement
	= "return" EC args:ExpressionList?
		{ return { type: "ReturnStatement", args } }

BreakStatement
	= "break" EC condition:Expression? labels:LabelList
		{ return { type: "BreakStatement", condition, labels } }

TrapStatement
	= "trap" EC
		{ return { type: "TrapStatement" } }

NopStatement
	= "nop" EC
		{ return { type: "NopStatement" } }

SeperationStatement
	= ";" _
		{ return { type: "SeperatorStatement" } }

/*****
 *** Expressions
 *****/

Expression
	= IfExpression

IfExpression
	= "if" EC condition:Expression "then" EC body:Expression otherwise:("else" EC o:Expression { return o })?
		{ return { type: "IfExpression", condition, body, otherwise } }
	/ AssignmentExpression

AssignmentExpression
	= names:ReferenceList "=" _ values:ExpressionList
		{ return { type:"AssignmentExpression", names, values } }
	/ ComparisonExpression

ComparisonExpression
	= left:ShiftExpression ">=" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "GreaterEqual", left, right } }
	/ left:ShiftExpression "<=" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "LessEqual", left, right } }
	/ left:ShiftExpression ">" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Greater", left, right } }
	/ left:ShiftExpression "<" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Less", left, right } }
	/ left:ShiftExpression "==" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Equal", left, right } }
	/ left:ShiftExpression "!=" _ right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "NotEqual", left, right } }
	/ ShiftExpression

ShiftExpression
	= left:BitExpression "<<<" _ right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "RotateLeft", left, right } }
	/ left:BitExpression ">>>" _ right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "RotateRight", left, right } }
	/ left:BitExpression "<<" _ right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "ShiftLeft", left, right } }
	/ left:BitExpression ">>" _ right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "ShiftRight", left, right } }
	/ BitExpression

BitExpression
	= left:AddExpression "^" _ right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseXor", left, right } }
	/ left:AddExpression "&" _ right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseAnd", left, right } }
	/ left:AddExpression "|" _ right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseOr", left, right } }
	/ AddExpression

AddExpression
	= left:MultiplyExpression "+" _ right:AddExpression
		{ return { type:"BinaryOperation", operator: "Add", left, right } }
	/ left:MultiplyExpression "-" _ right:AddExpression
		{ return { type:"BinaryOperation", operator: "Subtract", left, right } }
	/ MultiplyExpression

MultiplyExpression
	= left:CastOperation "*" _ right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Multiply", left, right } }
	/ left:CastOperation "/" _ right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Divide", left, right } }
	/ left:CastOperation "%" _ right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Modulo", left, right } }
	/ CastOperation

CastOperation
	= value:UnaryExpression ":" _ type:Type
		{ return { type: "CastExpression", type, value } }
	/ value:UnaryExpression "~" _ type:Type
		{ return { type: "ReinterpretExpression", type, value } }
	/ UnaryExpression

UnaryExpression
	= Number
	/ StructureInitializer
	/ Reference
	/ "sizeof" EC value:Type
		{ return { type: "SizeOf", value } }
	/ "{" _ body:Definition* "}" _
		{ return { type: "BlockExpression", body } }
	/ "(" _ value:Expression ")" _
		{ return value }
	/ "&" _ entity:Expression
		{ return { type: "Reference", entity } }
	/ "-" _ entity:Expression
		{ return { type: "UnaryNegate", entity } }

StructureInitializer
	= "[" _ a:StructureField b:("," _ b:StructureField { return b })* "]" _

StructureField
	= FieldInitializer
	/ Expression

FieldInitializer
	= "." _ name:Identifier "=" _ value:Expression
		{ return { type:"FieldInitializer", name, value } }

CallOperation
	= "(" _ args:ExpressionList? ")" _
		{ return { type: "CallOperation", args } }

IndexOperation
	= "[" _ index:Expression "]" _
		{ return { type: "IndexOperation", index } }

PropertyOperation
	= "." _ name:Identifier
		{ return { type: "PropertyOperation", name } }

/*****
 *** Other
 *****/

ReturnList
	= ":" _ l:TypeList
		{ return l }

ExpressionList
	= a:Expression b:("," _ b:Expression { return b })*
		{ return { type: "ExpressionSet", values:[a].concat(b) } }

LabelList
	= a:Label b:("," _ b:Label { return b })*
		{ return [a].concat(b) }

VariableList
	= a:Variable b:("," _ b:Variable { return b })*
		{ return [a].concat(b) }

ReferenceList
	= a:Reference b:("," _ b:Reference { return b })*
		{ return [a].concat(b) }

TypeList
	= a:Type b:("," _ b:Type { return b })*
		{ return [a].concat(b) }

Reference
	= "*" _ entity:Expression
		{ return { type: "Dereference", entity } }
	/ name:Identifier set:(IndexOperation / CallOperation / PropertyOperation)*
		{ return set.reduce((acc, op) => (op.value = acc, op), name); }

Variable
	= name:Identifier ":" _ type: Type
		{ return { type: "reference", name, type } }

Identifier
	= !(Reserved EC) name:$([_a-z]i [_a-z0-9]i*) _
		{ return { type: "Identifier", name } }
    / name:String
		{ return { type: "Identifier", name } }

Type
	= AtomicType
	/ StructDeclaration
	/ name:Identifier
		{ return { type: "DefinedType", name } }
	/ "*" _ type:Type
		{ return { format: "pointer", type } }
	/ "[" _ size:Expression "]" _ type:Type
		{ return { format: "array", size, type } }
	/ CallDeclaration

AtomicType
	= "u32" EC
		{ return { signed: false, format: "integer", size: 32 } }
	/ "u64" EC
		{ return { signed: false, format: "integer", size: 64 } }
	/ "s32" EC
		{ return { signed: true, format: "integer", size: 32 } }
	/ "s64" EC
		{ return { signed: true, format: "integer", size: 64 } }
	/ "f32" EC
		{ return { format: "decimal", size: 32 } }
	/ "f64" EC
		{ return { format: "decimal", size: 64 } }

Label
	= "@" _ name:Identifier
		{ return { type: "Label", name } }

Number
	= v:$("-"? "0x"i [0-9a-f]i+) _
		{ return { type: "Number", value: Number(v) || 0 } }
	/ v:$("-"? "0b"i [01]i+) _
		{ return { type: "Number", value: Number(v) || 0 } }
	/ v:$("-"? "0" [0-7]i+) _
		{ return { type: "Number", value: Number(v) || 0 } }
	/ v:$("-"? [0-9]+ ("." [0-9]+)?) _
		{ return { type: "Number", value: Number(v) || 0 } }

String
	= '"' v:(!'"' v:EscapedChar { return v })* '"' _
		{ return v }
    / "'" v:(!"'" v:EscapedChar { return v })* "'" _
		{ return v }

EscapedChar
	= "\\n" 	{ return '\n' }
    / "\\r" 	{ return '\r' }
    / "\\" v:. 	{ return v; }
    / .

Export
	= "export" EC
		{ return true; }

Import
	= "import" EC
		{ return true; }

Reserved
	= "import" / "export"
	/ "sizeof"
	/ "struct" / "union"
    / "memory" / "func" / "def" / "const"
    / "if" / "then" / "else" / "loop"
    / "break" / "trap" / "nop" / "return"
    / "u32" / "u64" / "s32" / "s64" / "f32" / "f64"

EC 	= ![_a-z0-9]i _
_ 	= __*
__ 	= [ \t\n]+
	/ "#" (![\n\r] .)+
