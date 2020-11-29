#include "include/NodeVisitor.hpp"

namespace nv{

void print_tree(ast::AST *root){
    if(root == NULL)
        return;
    print_tree(root->left_node);
    print_tree(root->right_node);
    std::cout << *tk::tok_to_str(root->token) << std::endl;
}

}
