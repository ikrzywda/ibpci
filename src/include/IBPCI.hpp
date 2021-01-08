#ifndef IBPCI_HPP
#define IBPCI_HPP

#include "AST.hpp"
#include "CallStack.hpp"
#include <stack>
#include <memory>
#include <utility>

namespace IBPCI{


struct variant_type{
    int active_type;
    double val_num;
    std::string val_str;
};

class Interpreter{
private:
    cstk::CallStack call_stack;
    ast::AST *tree;
    void error(std::string message, ast::AST *leaf);
    double binop(ast::AST *root);
    double unary_min(ast::AST *root);
    bool condition(ast::AST *root);
    bool cmp(ast::AST *root);
    bool cmp_str(ast::AST *root);
    std::string concatenation(ast::AST *root);
    void exec_block(ast::AST *root);
    void assign(ast::AST *root);
    void exec_if(ast::AST *root);
    void exec_whl(ast::AST *root);
    void exec_for(ast::AST *root);
    void output(ast::AST *root);
    int scout_type(ast::AST *root);
public:
    Interpreter(ast::AST *tree);
    void interpret();
};

}

#endif
