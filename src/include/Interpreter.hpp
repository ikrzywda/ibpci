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
    tk::Token *binop(ast::AST *root);
    bool check_types(tk::Token *l, tk::Token *r);
    tk::Token *add(tk::Token *l, tk::Token *r);
    tk::Token *subtract(tk::Token *l, tk::Token *r);
    tk::Token *multiply(tk::Token *l, tk::Token *r);
    tk::Token *divide(tk::Token *l, tk::Token *r);
    tk::Token *int_div(tk::Token *l, tk::Token *r);
    tk::Token *modulo(tk::Token *l, tk::Token *r);
    tk::Token *negative(tk::Token *val);
public:
    Interpreter(ast::AST *tree);
    void interpret();
};

}

#endif
