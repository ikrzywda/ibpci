#ifndef CALL_STACK_HPP
#define CALL_STACK_HPP

#include "ActivationRecord.hpp"
#include "AST.hpp"
#include <stack>
#include <memory>
#include <string>

namespace cstk{

typedef std::stack<std::unique_ptr<ar::AR>> c_stck;

class CallStack{
private:
    c_stck call_stack;
public:
    void push(std::string key, double val);
    void push(std::string key, std::string val);
    double peek_for_num(std::string key, ast::AST *leaf);
    std::string peek_for_str(std::string key, ast::AST *leaf);
    bool empty();
    void test();
    CallStack(ast::AST *tree);
    CallStack() = default;
};

}

#endif
