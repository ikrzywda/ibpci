#ifndef IBPCI_HPP
#define IBPCI_HPP

#include "AST.hpp"
#include "CallStack.hpp"
#include "Token.hpp"
#include "Lexer.hpp"
#include <map>
#include <memory>
#include <utility>

namespace IBPCI{

typedef std::map<std::string, ast::AST*> method_map;
typedef std::vector<std::unique_ptr<rf::Reference>> computed_params;
typedef std::unique_ptr<rf::Reference> return_ref;

class Interpreter{
private:
    cstk::CallStack call_stack;
    ast::AST *tree;
    method_map methods;
    computed_params cp;
    void error(std::string message, ast::AST *leaf);
    void error(std::string message, tk::Token *token);
    void method_decl(ast::AST *root);
    tk::Token *method_call(ast::AST *root);
    void assign(ast::AST *root);
    tk::Token *compute(ast::AST *root);
    tk::Token *binop(tk::Token *l, tk::Token *r, int op);
    bool check_types(tk::Token *l, tk::Token *r);
    tk::Token *add(tk::Token *l, tk::Token *r);
    tk::Token *divide(tk::Token *l, tk::Token *r, int op);
    tk::Token *negative(tk::Token *val);
    bool condition(ast::AST *root);
    bool numerical_comparison(tk::Token *l, tk::Token *r, int op);
    bool equal(tk::Token *l, tk::Token *r);
public:
    Interpreter(ast::AST *tree);
    void interpret();
};

}

#endif
