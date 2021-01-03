#ifndef IBPCC_HPP
#define IBPCC_HPP

#include "AST.hpp"
#include "Symtab.hpp"
#include "Parser.hpp"
#include <iostream>
#include <string>
#include <memory>

namespace ibpcc{

class IBPCC{
private:
    sym::Symtab symtab;
    void populate_symtab(std::string scope_name, ast::AST *root);
    bool log_assignment(std::string scope_name, ast::AST *root);
    void log_method(ast::AST *root);
    void log_params(std::string scope_name, ast::AST *root);
    sym::Reference *populate_var(ast::AST *root, int type);
    sym::Reference *populate_arr(ast::AST *root);
    void get_array_template(ast::AST *root, sym::Reference *ref);
    void get_contents(ast::AST *root, unsigned nesting, sym::Reference *ref);
    void reduce_symtab(ast::AST *root, std::vector<unsigned> *indeces);
    void execute(ast::AST *root);
    void binop(ast::AST *root);
    void assign(ast::AST *root);
    void output(ast::AST *root);
public:
    IBPCC(ast::AST *root);
};

    

}

#endif
