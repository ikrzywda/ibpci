#ifndef IBPCI_HPP
#define IBPCI_HPP

#include "AST.hpp"
#include "CallStack.hpp"
#include "Token.hpp"
#include "Lexer.hpp"
#include <stack>
#include <map>
#include <memory>
#include <utility>

namespace IBPCI{

typedef std::map<std::string, ast::AST*> method_map;
typedef std::vector<std::unique_ptr<ar::Reference>> computed_params;

struct variant_type{
    int active_type;
    double val_num;
    std::string val_str;
};

class Interpreter{
private:
    cstk::CallStack call_stack;
    ast::AST *tree;
    method_map methods;
    computed_params cp;
    void error(std::string message, ast::AST *leaf);
    void method_decl(ast::AST *root);
    void method_call(ast::AST *root);
    double binop(ast::AST *root);
    std::string concatenation(ast::AST *root);
    double unary_min(ast::AST *root);
    bool condition(ast::AST *root);
    bool cmp(ast::AST *root);
    bool cmp_str(ast::AST *root);
    void exec_block(ast::AST *root);
    void assign(ast::AST *root);
    void exec_if(ast::AST *root);
    void exec_whl(ast::AST *root);
    void exec_for(ast::AST *root);
    tk::Token &input(ast::AST *root);
    void output(ast::AST *root);
    ast::AST *lookup_method(std::string key, ast::AST *leaf);
    void collect_params(ast::AST *root);
    void init_record(ast::AST *root);
    int scout_type(ast::AST *root);
    void print_methods();
public:
    Interpreter(ast::AST *tree);
    void interpret();
};

}

#endif
