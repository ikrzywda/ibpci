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
void print_table();
void insert_symbol();
void assignment(ast::AST *root); 
void output(ast::AST *root);
float binop(ast::AST *root);
void execute(ast::AST *root);

}

#endif
