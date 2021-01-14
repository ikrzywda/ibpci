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

void CallStack::push(std::string key, tk::Token *terminal){
    call_stack.top().get()->insert(key, terminal);
}

void CallStack::push(std::string key, rf::Reference *terminal){
    call_stack.top().get()->insert(key, terminal);
}
    
void CallStack::push(std::string key, unsigned address, rf::Reference *terminal){
    call_stack.top().get()->mutate_array(key, address, terminal);
}


ast::AST *CallStack::peek_for_root(){
    return call_stack.top()->lookup_root();
}

std::string CallStack::peek_for_name(){
    return call_stack.top().get()->lookup_name();
}

rf::Reference *CallStack::peek(std::string key, ast::AST *leaf){
    return call_stack.top().get()->lookup(key, leaf);
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

void CallStack::print(){
    call_stack.top().get()->print();
}

}
