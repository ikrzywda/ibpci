#ifndef CALL_STACK_HPP
#define CALL_STACK_HPP

#include "ActivationRecord.hpp"
#include "AST.hpp"
#include "Token.hpp"
#include <stack>
#include <memory>
#include <string>

namespace cstk{

typedef std::stack<std::unique_ptr<ar::AR>> c_stck;

class CallStack
{

private:
    c_stck call_stack;
    bool log_stack;

public:
    void pop();
    void push_AR(std::string name, ast::AST *root);
    void push(std::string key, tk::Token *terminal);
    void push(std::string key, rf::Reference *terminal);
    void push(std::string key, unsigned address, rf::Reference *terminal);
    ast::AST *peek_for_root();
    std::string peek_for_name();
    rf::Reference *peek(std::string key, ast::AST *leaf);
    bool empty();
    void test();
    void print(bool entering);
    CallStack(ast::AST *tree, bool log);
    CallStack() = default;
};

}

#endif
