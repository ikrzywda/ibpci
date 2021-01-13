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
    void error(std::string message, rf::Reference *token);
    void method_decl(ast::AST *root);
    rf::Reference *method_call(ast::AST *root);
    void assign(ast::AST *root);
    rf::Reference *compute(ast::AST *root);
    rf::Reference *binop(rf::Reference *l, rf::Reference *r, int op);
    int check_types(rf::Reference *l, rf::Reference *r);
    rf::Reference *add(rf::Reference *l, rf::Reference *r);
    rf::Reference *divide(rf::Reference *l, rf::Reference *r, int op);
    rf::Reference *negative(rf::Reference *val);
    bool condition(ast::AST *root);
    bool numerical_comparison(rf::Reference *l, rf::Reference *r, int op);
    bool equal(rf::Reference *l, rf::Reference *r);
    rf::Reference *declare_empty_array(ast::AST *root);
    rf::Reference *make_array(ast::AST *root);
    void get_contents(ast::AST *root, rf::Reference *arr, unsigned nesting);
    void get_dimensions(ast::AST *root, rf::Reference *arr);
    rf::Reference *access_array(ast::AST *root);
    unsigned compute_key(ast::AST *accessor, rf::Reference *arr);
    void std_void(ast::AST *root);
    void push(ast::AST *root);
    void enqueue(ast::AST *root);
    rf::Reference *std_return(ast::AST *root);
    rf::Reference *length(ast::AST *root);
    rf::Reference *pop(ast::AST *root);
    rf::Reference *dequeue(ast::AST *root);
    rf::Reference *get_next(ast::AST *root);
    rf::Reference *empty(ast::AST *root);
public:
    Interpreter(ast::AST *tree);
    void interpret();
};

}

#endif
