#include "include/Reference.hpp"

namespace rf{

Reference::Reference(ast::AST *terminal) : token(&terminal->token){
    size = 1;
}

void Reference::set_value(ast::AST *terminal){
    switch(terminal->id){
        case ast::ARR: break;
        default: token = tk::Token(terminal->token);
    }
}

tk::Token *Reference::get_token(){
    return &token;
}

void Reference::print(){
    token.print();
}

}
