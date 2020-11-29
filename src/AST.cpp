#include "include/AST.hpp"

namespace ast{

AST::AST(int id, AST *ln, tk::Token *tk, AST *rn){
    AST::id = id;
    left_node = ln;
    right_node = rn;
    token = tk;
}

AST::AST(tk::Token *tk){
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

void print_tree_in_ast(AST *root){
    if(root == NULL)
        return;
    print_tree_in_ast(root->left_node);
    print_tree_in_ast(root->right_node);
    std::cout << *tk::tok_to_str(root->token) << std::endl;
}

}
