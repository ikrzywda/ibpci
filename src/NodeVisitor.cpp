#include "include/NodeVisitor.hpp"

namespace nv{

void print_tree(ast::AST *root){
    if(root == NULL)
        return;
        print_tree(root->left_node);
        print_tree(root->right_node);
        std::cout << *ast::id_to_str(root) << std::endl;
}

}
