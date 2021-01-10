#include "include/Reference.hpp"

namespace rf{

Reference::Reference(ast::AST *terminal) : token(&terminal->token){
    size = 1;
}

Reference::Reference(tk::Token *terminal) : token(terminal){
    size = 1;
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

tk::Token *Reference::get_token(){
    return &token;
}

void Reference::print(){
    token.print();
}

}
