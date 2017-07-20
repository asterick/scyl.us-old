/* lexical grammar */
%lex
ec                          (?![a-zA-Z0-9_])

%%
\s+                         /* skip whitespace */
"#".*                       /* skip comment */

/* Operators */
":="                        return ":="
"=="                        return "=="
"!="                        return "!="
">="                        return ">="
"<="                        return "<="
"<<<"                       return "<<<"
">>>"                       return ">>>"
"<<"                        return "<<"
">>"                        return ">>"
"="                         return "="
">"                         return ">"
"<"                         return "<"
"^"                         return "^"
"&"                         return "&"
"|"                         return "|"
"+"                         return "+"
"-"                         return "-"
"*"                         return "*"
"/"                         return "/"
"%"                         return "%"
":"                         return ":"
"~"                         return "~"
","                         return ","
"."                         return "."
"@"                         return "@"
"-"                         return "-"
"("                         return "("
")"                         return ")"
"{"                         return "{"
"}"                         return "}"
"["                         return "["
"]"                         return "]"
";"                         return ";"

/* Formatted numbers */
"-"?"0"[xX][0-9a-fA-F]+     return "NUMBER"
"-"?"0"[bB][01]+            return "NUMBER"
"-"?"0"[0-7]+               return "NUMBER"
"-"?[0-9]+("."[0-9]+)?      return "NUMBER"

/* Reserved words */
"and"{ec}                   return "AND"
"or"{ec}                    return "OR"
"import"{ec}                return "IMPORT"
"export"{ec}                return "EXPORT"
"sizeof"{ec}                return "SIZEOF"
"struct"{ec}                return "STRUCT"
"union"{ec}                 return "UNION"
"memory"{ec}                return "MEMORY"
"func"{ec}                  return "FUNC"
"def"{ec}                   return "DEF"
"var"{ec}                   return "VAR"
"const"{ec}                 return "CONST"
"if"{ec}                    return "IF"
"then"{ec}                  return "THEN"
"else"{ec}                  return "ELSE"
"loop"{ec}                  return "LOOP"
"break"{ec}                 return "BREAK"
"trap"{ec}                  return "TRAP"
"nop"{ec}                   return "NOP"
"return"{ec}                return "RETURN"
"unsigned"{ec}              return "UNSIGNED"
"signed"{ec}                return "SIGNED"
"float"{ec}                 return "FLOAT"

\"((?!\").)*\"              yytext = JSON.parse(yytext); return "STRING"   //"
\'((?!\').)*\'              yytext = JSON.parse(yytext); return "STRING"

"@"[a-zA-Z_][a-zA-Z0-9_]*   yytext = yytext.substr(1); return "LABEL"
[a-zA-Z_][a-zA-Z0-9_]*      return "IDENTIFIER"
<<EOF>>                     return "EOF"
.                           return "ILLEGAL"

/lex

%start Module

%right ASSIGN
%nonassoc '>=' '<=' '>' '<' '!=' '=='
%left '<<' '>>' '<<<' '>>>'
%left '&' '^' '|'
%left '+' '-'
%left '*' '/' '%'
%left CAST COERSE
%left MINUS REFERENCE DEREFERENCE COMPLEMENT
%left CALL INDEX PROPERTY
%nonassoc GROUP

%% /* language grammar */

Module
    : StatementList EOF
        { return $1 }
    ;

Statement
    : ImportStatement
    | ExportStatement
    | LabelStatement
    | FunctionStatement
    | EntityStatement
    | LoopStatement
    | ReturnStatement
    | TrapStatement
    | NopStatement
    | SeperationStatement
    | BreakStatement

    | BlockStatement
    | AssignmentStatement
    | CallStatement
    | IfStatement
    ;

FunctionDeclaration
    : FUNC IDENTIFIER "(" ParameterList ")" ReturnList
        { $$ = { type: "FunctionDeclaration", name: $2, parameters: $4, returns: $6 } }
    ;

MemoryDeclaration
    : MEMORY IDENTIFIER
        { $$ = { type: "MemoryDeclaration", name: $2 } }
    ;

EntityDeclaration
    : CONST Entity
        { $$ = { type: "ConstantDeclaration", entity: $2 } }
    | VAR Entity
        { $$ = { type: "VariableDeclaration", entity: $2 } }
    | DEF Entity
        { $$ = { type: "TypeDeclaration", entity: $2 } }
    ;

ImportStatement
    : IMPORT FunctionDeclaration
        { $$ = { type: "Import", declaration: $2 } }
    | IMPORT EntityDeclaration
        { $$ = { type: "Import", declaration: $2 } }
    | IMPORT MemoryDeclaration
        { $$ = { type: "Import", declaration: $2 } }
    ;
ExportStatement
    : EXPORT FunctionStatement
        { $$ = { type: "Export", definition: $2 } }
    | EXPORT EntityStatement
        { $$ = { type: "Export", definition: $2 } }
    | EXPORT MemoryDeclaration
        { $$ = { type: "Export", definition: $2 } }
    ;

BlockStatement
    : "{" StatementList "}"
        { $$ = { type: "BlockStatement", body: $2 } }
    ;

CallStatement
    : ValueExpression "(" ArgumentList ")"
        { $$ = { type: "CallStatement", parameters: $3, target: $1 } }
    ;

AssignmentStatement
    : ValueList ":=" ExpressionList
        { $$ = { type: "AssignmentStatement", targets: $1, values: $3 } }
    ;

IfStatement
    : IF Expression THEN Statement ELSE Statement
        { $$ = { type: "IfStatement", condition: $2, onTrue: $2, onFalse: $4 } }
    | IF Expression THEN Statement
        { $$ = { type: "IfStatement", condition: $2, onTrue: $2, onFalse: null } }
    ;

FunctionStatement
    : FUNC IDENTIFIER "(" EntityList ")" ReturnList Statement
        { $$ = { type: "FunctionStatement", name: $2, parameters: $4, returns: $6, body: $7 } }
    ;

EntityStatement
    : EntityDeclaration "=" Expression
        { $$ = { type: "EntityStatement", entity: $1, initializer: $3 }}
    | EntityDeclaration
        { $$ = { type: "EntityStatement", entity: $1, initializer: null }}
    ;

/* Statements */
LabelStatement
    : LABEL
        { $$ = { type: "LabelStatement", label: $1 } }
    ;

LoopStatement
    : LOOP Statement
        { $$ = { type: "LoopStatement", body: $2 } }
    ;

ReturnStatement
    : RETURN ArgumentList
        { $$ = { type: "ReturnStatement", values: $2 } }
    ;

BreakStatement
    : BREAK LABEL
        { $$ = { type: "BreakStatement", target: $2 } }
    | BREAK
        { $$ = { type: "BreakStatement", target: null } }
    ;

TrapStatement
    : TRAP
        { $$ = { type: "TrapStatement" } }
    ;

NopStatement
    : NOP
        { $$ = { type: "NopStatement" } }
    ;

SeperationStatement
    : ";"
        { $$ = { type: "SeperationStatement" } }
    ;

/* Expressions */
Expression
    : IF Expression THEN Expression ELSE Expression
        { $$ = { type: "IfExpression", condition: $2, onTrue: $2, onFalse: $4 } }
    | IF Expression THEN Expression
        { $$ = { type: "IfExpression", condition: $2, onTrue: $2, onFalse: null } }

    | ValueExpression "=" Expression %prec ASSIGN
        { $$ = { type: "AssignmentExpression", targets: $1, values: $3 } }

    | Expression AND Expression
        { $$ = { type: "LogicalAndExpression", left: $1, right: $3 } }
    | Expression OR Expression
        { $$ = { type: "LogicalOrExpression", left: $1, right: $3 } }

    | Expression ">=" Expression
        { $$ = { type: "GreaterEqualExpression", left: $1, right: $3 } }
    | Expression "<=" Expression
        { $$ = { type: "LessEqualExpression", left: $1, right: $3 } }
    | Expression ">" Expression
        { $$ = { type: "GreaterExpression", left: $1, right: $3 } }
    | Expression "<" Expression
        { $$ = { type: "LessExpression", left: $1, right: $3 } }
    | Expression "!=" Expression
        { $$ = { type: "NotEqualExpression", left: $1, right: $3 } }
    | Expression "==" Expression
        { $$ = { type: "EqualExpression", left: $1, right: $3 } }

    | Expression ">>" Expression
        { $$ = { type: "ShiftRightExpression", left: $1, right: $3 } }
    | Expression "<<" Expression
        { $$ = { type: "ShiftLeftExpression", left: $1, right: $3 } }
    | Expression ">>>" Expression
        { $$ = { type: "RotateRightExpression", left: $1, right: $3 } }
    | Expression "<<<" Expression
        { $$ = { type: "RotateLeftExpression", left: $1, right: $3 } }

    | Expression "^" Expression
        { $$ = { type: "BitwiseXOrExpression", left: $1, right: $3 } }
    | Expression "&" Expression
        { $$ = { type: "BitwiseAndExpression", left: $1, right: $3 } }
    | Expression "|" Expression
        { $$ = { type: "BitwiseOrExpression", left: $1, right: $3 } }

    | Expression "+" Expression
        { $$ = { type: "AddExpression", left: $1, right: $3 } }
    | Expression "-" Expression
        { $$ = { type: "SubtractExpression", left: $1, right: $3 } }

    | Expression "*" Expression
        { $$ = { type: "MultiplyExpression", left: $1, right: $3 } }
    | Expression "/" Expression
        { $$ = { type: "DivideExpression", left: $1, right: $3 } }
    | Expression "%" Expression
        { $$ = { type: "ModuloExpression", left: $1, right: $3 } }

    | Expression ":" Type %prec COERSE
        { $$ = { type: "CoerseExpression", left: $1, right: $3 } }
    | Expression "~" Type %prec CAST
        { $$ = { type: "CastExpression", left: $1, right: $3 } }

    | "-" Expression %prec MINUS
        { $$ = { type: "NegateExpression", value: $2 } }
    | "&" Expression %prec REFERENCE
        { $$ = { type: "ReferenceExpression", value: $2 } }
    | "~" Expression %prec COMPLEMENT
        { $$ = { type: "ComplementExpression", value: $2 } }

    | ValueExpression
    | ConstantExpression
    ;

ConstantExpression
    : SIZEOF Type
        { $$ = { type: "SizeOfExpression", body: $2 } }
    | Number
    ;

ValueExpression
    : ValueExpression "[" Expression "]" %prec INDEX
        { $$ = { type: "IndexExpression", index: $3, target: $1 } }
    | ValueExpression "." IDENTIFIER %prec PROPERTY
        { $$ = { type: "PropertyExpression", index: $3, target: $1 } }
    | "*" ValueExpression %prec DEREFERENCE
        { $$ = { type: "DereferenceExpression", parameters: $2 } }
    | ValueExpression "(" ArgumentList ")" %prec CALL
        { $$ = { type: "CallExpression", parameters: $3, target: $1 } }
    | "(" Expression ")"
        { $$ = $2 }
    | IDENTIFIER
        { $$ = { type: "Identifier", name: $1 } }
    ;

/* Atomic helpers */
Type
    : STRUCT "{" EntityList "}"
        { $$ = { type: "StructType", elements: $3 } }
    | UNION "{" EntityList "}"
        { $$ = { type: "UnionType", elements: $3 } }
    | "*" Type
        { $$ = { type: "PointerType", type: $2 } }
    | "[" Expression "]" Type
        { $$ = { type: "ArrayType", size: $2, type: $4 } }
    | UNSIGNED Number
        { $$ = { type: "IntegerType", size: $2, signed: "false" } }
    | SIGNED Number
        { $$ = { type: "IntegerType", size: $2, signed: "true" } }
    | FLOAT Number
        { $$ = { type: "FloatType", size: $2 } }
    | IDENTIFIER
        { $$ = { type: "DefinedType", name: $1 } }
    | "(" ParameterList ")" ReturnList
        { $$ = { type: "FunctionType", parameters: $2, returns: $4 } }
    ;

Number
    : NUMBER
        { $$ = { type: "Number", value: Number(yytext) } }
    ;

Entity
    : IDENTIFIER ":" Type
        { $$ = { type: "Entity", name: $1, type: $3 } }
    ;

/* Lists */
StatementList
    : Statement StatementList
        { $$ = [$1].concat($2) }
    | Statement
        { $$ = [$1] }
    ;

ValueList
    : ValueExpression "," ValueList
        { $$ = [$1].concat($3) }
    | ValueExpression
        { $$ = [$1] }
    ;

ExpressionList
    : Expression "," ExpressionList
        { $$ = [$1].concat($3) }
    | Expression
        { $$ = [$1] }
    ;

EntityList
    : Entity "," EntityList
        { $$ = [$1].concat($3) }
    | Entity
        { $$ = [$1] }
    |
    ;

TypeList
    : Type "," TypeList
        { $$ = [$1].concat($3) }
    | Type
        { $$ = [$1] }
    ;

/* Optional Lists */
ArgumentList
    : ExpressionList
    |
        { $$ = null }
    ;

ParameterList
    : TypeList
    |
        { $$ = null }
    ;

ReturnList
    : ":" TypeList
        { $$ = $2 }
    |
        { $$ = null }
    ;
