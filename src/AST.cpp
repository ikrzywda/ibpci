#include "include/AST.hpp"

namespace ast{

AST *BinOp(AST *left_node, tk::Token *token, AST *right_node){
    AST *new_ast = new AST;
    new_ast->id = BINOP;
    new_ast->nodes.push_back(left_node);
    new_ast->nodes.push_back(right_node);
    new_ast->token = token;
    std::cout << new_ast->token << std::endl;
    return new_ast;
}

AST *Num(tk::Token *token){
    AST *leaf = new AST;
    leaf->id = NUM;
    leaf->token = token;
    std::cout << leaf->token << std::endl;
    return leaf;
}

}
