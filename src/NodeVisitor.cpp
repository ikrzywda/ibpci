#include "include/NodeVisitor.hpp"

namespace nv{

void print_ast(ast::AST *root){
    if(root == NULL) return;
    switch(root->id){
        case ast::BINOP:
            print_ast(root->nodes.at(0)); 
            print_ast(root->nodes.at(1));           
            break;
        case ast::NUM: 
            std::cout << *tk::tok_to_str(root->token) << std::endl;
            break;
    }
}

}
