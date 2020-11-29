#include "include/AST.hpp"

namespace ast{

AST::AST(int id, AST *ln, tk::Token *tk, AST *rn){
    std::cout << "full node created!\n";
    AST::id = id;
    left_node = ln;
    right_node = rn;
    token = tk;
}

AST::AST(tk::Token *tk){
    std::cout << "leaf created!\n";
    id = TOKEN;
    token = tk;
    left_node = right_node = NULL;
}   

std::string *id_to_str(AST *node){
    std::string *out = new std::string;
    switch(node->id){
        case TOKEN: *out = *tk::tok_to_str(node->token); break;
        case BIN_OP: *out = "bin_op"; break;
        default: *out = "null"; break;
    }
    return out;
}

}
