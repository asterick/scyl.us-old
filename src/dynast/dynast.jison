 /* description: Parses end evaluates mathematical expressions. */

/* lexical grammar */
%lex
ec                      (?![a-zA-Z0-9_])

%%
\s+                     /* skip whitespace */
"#".*                   /* skip comment */

/* Operators */
"("                     return "("
")"                     return ")"
"{"                     return "{"
"}"                     return "}"
"["                     return "["
"]"                     return "]"
";"                     return ";"
"="                     return "="
"=="                    return "=="
"!="                    return "!="
">="                    return ">="
"<="                    return "<="
">"                     return ">"
"<"                     return "<"
"<<<"                   return "<<<"
">>>"                   return ">>>"
"<<"                    return "<<"
">>"                    return ">>"
"^"                     return "^"
"&"                     return "&"
"|"                     return "|"
"+"                     return "+"
"-"                     return "-"
"*"                     return "*"
"/"                     return "/"
"%"                     return "%"
":"                     return ":"
"~"                     return "~"
","                     return ","
"."                     return "."
"@"                     return "@"
"-"                     return "-"

/* Formatted numbers */
"-"?"0"[xX][0-9a-fA-F]+ return "NUMBER"
"-"?"0"[bB][01]+        return "NUMBER"
"-"?"0"[0-7]+           return "NUMBER"
"-"?[0-9]+("."[0-9]+)?  return "NUMBER"

/* Reserved words */
"import"{ec}            return "IMPORT"
"export"{ec}            return "EXPORT"
"sizeof"{ec}            return "SIZEOF"
"struct"{ec}            return "STRUCT"
"union"{ec}             return "UNION"
"memory"{ec}            return "MEMORY"
"func"{ec}              return "FUNC"
"def"{ec}               return "DEF"
"var"{ec}               return "VAR"
"const"{ec}             return "CONST"
"if"{ec}                return "IF"
"then"{ec}              return "THEN"
"else"{ec}              return "ELSE"
"loop"{ec}              return "LOOP"
"break"{ec}             return "BREAK"
"trap"{ec}              return "TRAP"
"nop"{ec}               return "NOP"
"return"{ec}            return "RETURN"
"unsigned"{ec}          return "UNSIGNED"
"signed"{ec}            return "SIGNED"
"float"{ec}             return "FLOAT"

\"((?!\").)*\"          yytext = JSON.parse(yytext); return "STRING"   //"
\'((?!\').)*\'          yytext = JSON.parse(yytext); return "STRING"

[a-zA-Z_][a-zA-Z0-9_]*  return "IDENTIFIER"
<<EOF>>                 return "EOF"
.                       return "ILLEGAL"

/lex

%start Module

%% /* language grammar */

Module
    : DefinitionList EOF
        { return $1 }
    ;

Definition
    : Import
    | Export
    | LabelStatement
    | FunctionDefinition
    | VariableDefinition
    | TypeDeclaration
    | LoopStatement
    | ReturnStatement
    | TrapStatement
    | NopStatement
    | SeperationStatement
    | BreakStatement
    | Expression
    ;

Import
    : IMPORT FunctionDeclaration
    | IMPORT VariableDeclaration
    | IMPORT MemoryDeclaration
    ;
Export
    : EXPORT FunctionDeclaration
    | EXPORT VariableDeclaration
    | EXPORT MemoryDeclaration
    ;

FunctionDeclaration
    : FUNC IDENTIFIER "(" TypeList ")" ReturnList
    | FUNC IDENTIFIER "(" ")" ReturnList
    ;

VariableDeclaration
    : CONST Entity
    | VAR Entity
    ;

CallDeclaration
    : FUNC IDENTIFIER "(" TypeList ")" ReturnList
    | FUNC IDENTIFIER "(" ")" ReturnList
    ;


StructDeclaration
    : STRUCT "{" EntityList "}"
    | UNION "{" EntityList "}"
    ;

MemoryDeclaration
    : MEMORY IDENTIFIER
    ;

FunctionDefinition
    : FUNC IDENTIFIER "(" EntityList ")" ReturnList Definition
    | FUNC IDENTIFIER "(" ")" ReturnList Definition
    ;

VariableDefinition
    : VariableDeclaration "=" Expression
    | VariableDeclaration
    ;

TypeDeclaration
    : DEF Entity
    ;

/* Statements */
LabelStatement
    : Label
    ;

LoopStatement
    : LOOP Definition
    ;

ReturnStatement
    : RETURN ExpressionList
    ;

BreakStatement
    : BREAK Label
    | BREAK
    ;

TrapStatement
    : TRAP
    ;

NopStatement
    : NOP
    ;

SeperationStatement
    : ";"
    ;

/* Expressions */
Expression // INCOMPLETE
    : Number
    ;

/* Lists */
DefinitionList
    : Definition DefinitionList
        { $$ = [$1].concat($2) }
    | Definition
        { $$ = [$1] }
    |
    ;

ExpressionList
    : Expression "," ExpressionList
        { $$ = [$1].concat($2) }
    | Expression
        { $$ = [$1] }
    |
    ;

EntityList
    : Entity "," EntityList
        { $$ = [$1].concat($2) }
    | Entity
        { $$ = [$1] }
    |
    ;

TypeList
    : Type "," TypeList
        { $$ = [$1].concat($2) }
    | Type
        { $$ = [$1] }
    |
    ;

ReturnList
    : ":" TypeList
    |
    ;

/* Atomic helpers */
Type
    : "*" Type
    | "[" Expression "]" Type
    | UNSIGNED Number
    | SIGNED Number
    | FLOAT Number
    | IDENTIFIER
    | CallDeclaration
    | StructDeclaration
    ;

Number
    : NUMBER
        { $$ = Number(yytext) }
    ;

Label
    : "@" IDENTIFIER
    ;

Entity
    : IDENTIFIER ":" Type
    ;
