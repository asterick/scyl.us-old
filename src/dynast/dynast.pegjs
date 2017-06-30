/*
 TODO: Memory
 */

Module
	= list:DefinitionBody* _
		{ return list }

DefinitionBody
	= Imports
	/ Exports
	/ Definition

Imports
	= Import decl:FunctionDeclaration
		{ return { type: "Import", decl } }
	/ Import decl:VariableDeclaration
		{ return { type: "Import", decl } }
	/ Import decl:MemoryDeclaration
		{ return { type: "Import", decl } }

Exports
	= Export decl:FunctionDefinition
		{ return { type: "Export", decl } }
	/ Export decl:VariableDefinition
		{ return { type: "Export", decl } }
	/ Export decl:MemoryDeclaration
		{ return { type: "Export", decl } }

Definition
	= Label
	/ FunctionDefinition
	/ VariableDefinition
	/ LoopStatement
	/ ReturnStatement
	/ TrapStatement
	/ NopStatement
	/ SeperationStatement
	/ BreakStatement
	/ Expression

CallDeclaration
	= _ "(" args:TypeList? _ ")" returns:ReturnList?
		{ return { type: "CallDeclaration", args, returns } }

FunctionDeclaration
	= _ "func" EC name:Identifier CallDeclaration
		{ return { type: "FunctionDeclaration", args, returns } }

MemoryDeclaration
	= _ "memory" { throw new Error("TODO") }

VariableDeclaration
	= StaticFlag? _ "def" EC list:Variable
		{ return { type: "VariableDeclaration", list } }
	/ StaticFlag? _ "const" EC list:Variable
		{ return { type: "VariableDeclaration", list } }

FunctionDefinition
	= _ "func" EC name:Identifier _ "(" args:VariableList? _ ")" returns:ReturnList? body:Definition
		{ return { type: "FunctionDefinition", args, returns, body } }

VariableDefinition
	= decls:VariableDeclaration value:(_ "=" v:Expression { return v })?
		{ return { type: "VariableDefinition", decls, value } }

StaticFlag
	= _ "static" EC

/*****
 *** Statements
 *****/

LoopStatement
	= _ "loop" EC body:Definition
		{ return { type: "LoopStatement", body } }

ReturnStatement
	= _ "return" EC args:ExpressionList?
		{ return { type: "ReturnStatement", args } }

BreakStatement
	= _ "break" EC condition:Expression? labels:LabelList
		{ return { type: "BreakStatement", condition, labels } }

TrapStatement
	= _ "trap" EC
		{ return { type: "TrapStatement" } }

NopStatement
	= _ "nop" EC
		{ return { type: "NopStatement" } }

SeperationStatement
	= _ ";"
		{ return { type: "SeperatorStatement" } }

/*****
 *** Expressions
 *****/

Expression
	= IfExpression

IfExpression
	= _ "if" EC condition:Expression _ "then" EC body:Expression _ "else" EC otherwise:Expression
		{ return { type: "IfExpression", condition, body, otherwise } }
	/ _ "if" EC condition:Expression _ "then" EC body:Expression
		{ return { type: "IfExpression", condition, body } }
	/ AssignmentExpression

AssignmentExpression
	= names:IdentifierList _ "=" values:ExpressionList
		{ return { type:"AssignmentExpression", names, values } }
	/ ComparisonExpression

ComparisonExpression
	= left:ShiftExpression _ ">=" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "GreaterEqual", left, right } }
	/ left:ShiftExpression _ ">" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Greater", left, right } }
	/ left:ShiftExpression _ "<=" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "LessEqual", left, right } }
	/ left:ShiftExpression _ "<" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Less", left, right } }
	/ left:ShiftExpression _ "==" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "Equal", left, right } }
	/ left:ShiftExpression _ "!=" right:ComparisonExpression
		{ return { type:"BinaryOperation", operator: "NotEqual", left, right } }
	/ ShiftExpression

ShiftExpression
	= left:BitExpression _ "<<<" right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "RotateLeft", left, right } }
	/ left:BitExpression _ ">>>" right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "RotateRight", left, right } }
	/ left:BitExpression _ "<<" right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "ShiftLeft", left, right } }
	/ left:BitExpression _ ">>" right:ShiftExpression
		{ return { type:"BinaryOperation", operator: "ShiftRight", left, right } }
	/ BitExpression

BitExpression
	= left:AddExpression _ "^" right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseXor", left, right } }
	/ left:AddExpression _ "&" right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseAnd", left, right } }
	/ left:AddExpression _ "|" right:BitExpression
		{ return { type:"BinaryOperation", operator: "BitwiseOr", left, right } }
	/ AddExpression

AddExpression
	= left:MultiplyExpression _ "+" right:AddExpression
		{ return { type:"BinaryOperation", operator: "Add", left, right } }
	/ left:MultiplyExpression _ "-" right:AddExpression
		{ return { type:"BinaryOperation", operator: "Subtract", left, right } }
	/ MultiplyExpression

MultiplyExpression
	= left:UnaryExpression _ "*" right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Multiply", left, right } }
	/ left:UnaryExpression _ "/" right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Divide", left, right } }
	/ left:UnaryExpression _ "%" right:MultiplyExpression
		{ return { type:"BinaryOperation", operator: "Modulo", left, right } }
	/ UnaryExpression

UnaryExpression
	= type:Type _ ":" value:Expression
		{ return { type: "CastExpression", type, value } }
	/ _ "{" body:Definition* _ "}"
		{ return { type: "BlockExpression", body } }
	/ _ "(" value:Expression _ ")"
		{ return value }
	/ _ "&" entity:Expression
		{ return { type: "Reference", entity } }
	/ _ "*" entity:Expression
		{ return { type: "Dereference", entity } }
	/ _ "-" entity:Expression
		{ return { type: "UnaryNegate", entity } }
	/ Number
	/ name:Identifier set:(IndexOperation / CallOperation / PropertyOperation)*
		{ return set.reduce((acc, op) => (op.value = acc, op), name); }

CallOperation
	= _ "(" args:ExpressionList? _ ")"
		{ return { type: "CallOperation", args } }

IndexOperation
	= _ "[" index:Expression _ "]"
		{ return { type: "IndexOperation", index } }

PropertyOperation
	= _ "." name:Identifier
		{ return { type: "PropertyOperation", name } }

/*****
 *** Other
 *****/

ReturnList
	= _ ":" l:TypeList
		{ return l }

ExpressionList
	= a:Expression b:(_ "," b:Expression { return b })*
		{ return [a].concat(b) }

LabelList
	= a:Label b:(_ "," b:Label { return b })*
		{ return [a].concat(b) }

VariableList
	= a:Variable b:(_ "," b:Variable { return b })*
		{ return [a].concat(b) }

IdentifierList
	= a:Identifier b:(_ "," b:Identifier { return b })*
		{ return [a].concat(b) }

TypeList
	= a:Type b:(_ "," b:Type { return b })*
		{ return [a].concat(b) }

Variable
	= name:Identifier _ ":" type: Type
		{ return { type: "reference", name, type } }

Identifier
	= _ !(Reserved EC) name:$([_a-z]i [_a-z0-9]i*)
		{ return { type: "Identifier", name } }
    / name:String
		{ return { type: "Identifier", name } }

Type
	= _ "u32"
		{ return { signed: false, format: "integer", size: 32 } }
	/ _ "u64"
		{ return { signed: false, format: "integer", size: 64 } }
	/ _ "s32"
		{ return { signed: true, format: "integer", size: 32 } }
	/ _ "s64"
		{ return { signed: true, format: "integer", size: 64 } }
	/ _ "f32"
		{ return { format: "decimal", size: 32 } }
	/ _ "f64"
		{ return { format: "decimal", size: 64 } }
	/ _ "*" type:Type
		{ return { format: "pointer", type } }
	/ _ "[" size:Expression _ "]" type:Type
		{ return { format: "array", size, type } }
	/ CallDeclaration

Label
	= _ "@" name:Identifier
		{ return { type: "Label", name } }

Number
	= _ v:$("-"? [0-9]+ ("." [0-9]+)?)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("-"? "0x"i [0-9a-f]i+)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("-"? "0b"i [01]i+)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("-"? "0" [0-7]i+)
		{ return { type: "Number", value: Number(v) || 0 } }

String
	= _ '"' v:(!'"' v:EscapedChar { return v })* '"'
		{ return v }
    / _ "'" v:(!"'" v:EscapedChar { return v })* "'"
		{ return v }

EscapedChar
	= "\\n" 	{ return '\n' }
    / "\\r" 	{ return '\r' }
    / "\\" v:. 	{ return v; }
    / .

Export
	= _ "export" EC
		{ return true; }

Import
	= _ "import" EC
		{ return true; }

Reserved
	= "import" / "export"
	/ "struct" / "union"
    / "memory" / "func" / "def" / "const" / "static"
    / "if" / "then" / "else" / "loop"
    / "break" / "trap" / "nop" / "return"
    / "u32" / "u64" / "s32" / "s64" / "f32" / "f64"

EC 	= ![_a-z0-9]i
_ 	= __*
__ 	= [ \t\n]+
	/ "#" (![\n\r] .)+
