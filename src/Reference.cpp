#include "include/Reference.hpp"

namespace rf{

Reference::Reference(Reference *ref) : token(ref->token){
    s = ref->s;
    for(auto &a : ref->adt){
        adt.push_back(new tk::Token(a));
    }
}

Reference::Reference(double value) : token(value){
    type = tk::NUM;
}

Reference::Reference(std::string value) : token(value){
    type = tk::STRING;
}

Reference::Reference(tk::Token *t) : token(t){
    type = t->id;
}

Reference::Reference(ast::AST *root) : token(&root->token){
    type = root->token.id;
}

Reference::~Reference(){
    while(!adt.empty()){
        delete adt.back();
        adt.pop_back();
    }
}

void Reference::set_value(ast::AST *terminal){
    switch(terminal->id){
        case ast::ARR: break;
        default: token = &terminal->token;
    }
}

void Reference::set_value(tk::Token *terminal){
    switch(terminal->id){
        case ast::ARR: break;
        default: token = terminal;
    }
}

void Reference::set_value(Reference *ref){
    type = ref->type;
    s = ref->s;
    token = ref->token;
}

int Reference::get_type(){
    return type;
}   

tk::Token *Reference::get_token(){
    return &token;
}

void Reference::push_contents(rf::Reference *element){
    std::cout << adt.size();
    adt.push_back(new tk::Token(element->token));
    std::cout << adt.size();
    delete element;
}

void Reference::push_dimension(unsigned d){
    s.push_back(d);
}

void Reference::print(){
    if(s.size() == 0){ 
        token.print();
    }else{
        for(auto &a : adt){
            a->print();
            std::cout << " ";
        }
    }
}

}
