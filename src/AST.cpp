#include "include/AST.hpp"

namespace ast{

AST::AST(AST *left_node, tk::Token *token, AST *right_node){
    AST::left_node = left_node;
    AST::right_node = right_node;
    AST::token = token;
}

void print_AST(AST *node){
    print_AST(node->left_node);
    print_AST(node->right_node);
    
    if(node != NULL){
        std::cout << *tk::tok_to_str(node->token);
        return;
    }
}

}
