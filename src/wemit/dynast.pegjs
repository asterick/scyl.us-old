Module
	= list:Definition* _
		{ return list }

Definition
	= Import FunctionDeclaration
	// Import MemoryDeclaration
	// Import TableDeclaration
	/ Import VariableDeclaration
	/ Export? FunctionDefinition
	/ Export? VariableDefinition
	// Export? MemoryDeclaration
	// Export? TableDefinition
	/ StartDefinition

FunctionDeclaration
	= _ "func" EC name:Identifier _ "(" args:VariableList? _ ")" returns:ReturnList?
		{ return { type: "FunctionDeclaration", name, args, returns } }

/*
MemoryDeclaration
	= .

TableDeclaration
	= .
*/

VariableDeclaration
	= _ "def" EC list:VariableList
		{ return { type: "VariableDeclaration", list } }

FunctionDefinition
	= _ decl:FunctionDeclaration body:CodeBody* _ "end" EC
		{ return { type: "FunctionDefinition", decl, body } }

StartDefinition
	= _ "start" body:CodeBody* _ "end" EC
		{ return { type: "StartDefinition", body } }

VariableDefinition
	= decls:VariableDeclaration values:(_ "=" v:ExpressionList { return v })?
		{ return { type: "VariableDefinition", decls, values } }

CodeBody
	= AssignmentStatement
	/ VariableDefinition
	/ IfStatement
	/ LoopStatement
	/ BlockStatement
	/ LabelStatement
	/ ReturnStatement
	/ TrapStatement
	/ NopStatement
	/ SeperationStatement
	/ BreakStatement
	/ InlineExpression

/*****
 *** Statements
 *****/

IfStatement
	= _ "if" EC condition:Expression _ "then" EC body:CodeBody* _ "else" EC otherwise:CodeBody* _ "end" EC
		{ return { type: "IfStatement", condition, body, otherwise } }
	/ _ "if" EC condition:Expression _ "then" EC body:CodeBody* _ "end" EC
		{ return { type: "IfStatement", condition, body } }

LoopStatement
	= _ "loop" EC body:CodeBody* _ "end" EC
		{ return { type: "LoopStatement", body } }

BlockStatement
	= _ "begin" EC body:CodeBody* _ "end" EC
		{ return { type: "BlockStatement", body } }

LabelStatement
	= _ ":" name:Identifier
		{ return { type: "LabelStatement", name } }

AssignmentStatement
	= names:IdentifierList _ "=" values:ExpressionList
		{ return { type:"AssignmentStatement", names, values } }

CallStatement
	= name:Identifier _ "(" args:ExpressionList? _ ")"
		{ return { type: "CallStatement", name, args } }

ReturnStatement
	= _ "return" EC args:ExpressionList?
		{ return { type: "ReturnStatement", args } }

BreakStatement
	= _ "break" EC condition:Expression? labels:(_ "in" EC labels:IdentifierList { return labels })?
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

InlineExpression
	= ComparisonExpression

Expression
	= _ "if" EC condition:Expression _ "then" EC onTrue:Expression _ "else" EC onFalse:Expression
		{ return { type: "IfStatement", condition, onTrue, onFalse } }
	/ AssignmentExpression

AssignmentExpression
	= ComparisonExpression _ "=" AssignmentExpression

ComparisonExpression
	= ShiftExpression _ ">=" ComparisonExpression
	/ ShiftExpression _ ">" ComparisonExpression
	/ ShiftExpression _ "<=" ComparisonExpression
	/ ShiftExpression _ "<" ComparisonExpression
	/ ShiftExpression _ "==" ComparisonExpression
	/ ShiftExpression _ "!=" ComparisonExpression
	/ ShiftExpression

ShiftExpression
	= BitExpression _ "<<" ShiftExpression
	/ BitExpression _ ">>" ShiftExpression
	/ BitExpression

BitExpression
	= AddExpression _ "^" BitExpression
	/ AddExpression _ "&" BitExpression
	/ AddExpression _ "|" BitExpression
	/ AddExpression

AddExpression
	= MultiplyExpression _ "+" AddExpression
	/ MultiplyExpression _ "-" AddExpression
	/ MultiplyExpression

MultiplyExpression
	= CastExpression _ "*" MultiplyExpression
	/ CastExpression _ "/" MultiplyExpression
	/ CastExpression

CastExpression
	= Type _ ":" Expression
	/ UnaryExpression

UnaryExpression
	= _ "(" Expression _ ")"
	/ Number
	/ CallStatement
	/ Identifier

/*****
 *** Other
 *****/

ReturnList
	= _ ":" l:TypeList
		{ return l }

ExpressionList
	= a:Expression b:(_ "," b:Expression { return b })*
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

Number
	= _ v:$([0-9]+ ("." [0-9]+)?)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("0x" [0-9a-f]i+)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("0b" [01]i+)
		{ return { type: "Number", value: Number(v) || 0 } }
	/ _ v:("0" [0-7]i+)
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
    / "memory" / "func" / "def"
    / "begin" / "if" / "then" / "else" / "loop" / "end"
    / "break" / "trap" / "nop" / "return"
    / "u32" / "u64" / "s32" / "s64" / "f32" / "f64"

EC 	= ![_a-z0-9]i
_ 	= __*
__ 	= [ \t\n]+
	/ "#" (![\n\r] .)+
