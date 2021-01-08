#include "include/CallStack.hpp"

namespace cstk{

CallStack::CallStack(ast::AST *tree){
    call_stack.push(std::make_unique<ar::AR>("main", tree));
}

void CallStack::pop(){
    call_stack.pop();
}

void CallStack::push_AR(std::string name, ast::AST *root){
    call_stack.push(std::make_unique<ar::AR>(name, root));
}

void CallStack::push(std::string key, double val){
    call_stack.top().get()->insert(key, val);
}

void CallStack::push(std::string key, std::string val){
    call_stack.top().get()->insert(key, val);
}

ast::AST *CallStack::peek_for_root(){
    return call_stack.top()->lookup_root();
}

std::string CallStack::peek_for_name(){
    return call_stack.top().get()->lookup_name();
}

double CallStack::peek_for_num(std::string key, ast::AST *leaf){
    return call_stack.top().get()->lookup_num(key, leaf);
}

std::string CallStack::peek_for_str(std::string key, ast::AST *leaf){
    return call_stack.top().get()->lookup_str(key, leaf);
}

int CallStack::peek_for_type(std::string key, ast::AST *leaf){
    return call_stack.top().get()->lookup_type(key, leaf);
}

bool CallStack::empty(){
    return call_stack.empty();
}

void CallStack::test(){
    do{
        call_stack.top().get()->print();
        call_stack.pop();
    }while(!call_stack.empty()); 
}

}
