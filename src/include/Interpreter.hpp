#ifndef INTERPRETER_HPP
#define INTERPRETER_HPP

#include "AST.hpp"
#include "Token.hpp"
#include "Symtab.hpp"
#include <map>
#include <vector>
#include <string>
#include <memory>

namespace pci{

enum types{
    VAR,
    METHOD
};

class Reference{
public:
    int type;
    ast::AST *root;
    Reference(int tp, ast::AST *rt);
};

//typedef const std::map<const char*, ast::AST*> symbol_table;
void interpret(ast::AST *root);
void print_table();
void insert_symbol();
void assignment(ast::AST *root); 
void output(ast::AST *root);
double binop(ast::AST *root);
ast::AST *variable(ast::AST *root);
void execute(ast::AST *root);
bool condition(ast::AST *root);
void if_statement(ast::AST *root);
bool else_statement(ast::AST *root);
bool elif_statement(ast::AST *root);
bool boolop(ast::AST *root);
}

#endif
