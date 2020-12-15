#ifndef INTERPRETER_HPP
#define INTERPRETER_HPP

#include "AST.hpp"
#include "Token.hpp"
#include "Symtab.hpp"

namespace pci{

class Interpreter{
    private:
        sym::Symtab *symtab_global;
        void assignment(ast::AST *root); 
        void output(ast::AST *root);
        void input(ast::AST *root);
        const char *binop(ast::AST *root);
        int binop_find_type(ast::AST *root);
        const char *binop_str(ast::AST *root);
        float binop_num(ast::AST *root);
    public:
        Interpreter(ast::AST *root);
        void execute(ast::AST *root);
};

}

#endif
