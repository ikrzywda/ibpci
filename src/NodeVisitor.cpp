#include "include/NodeVisitor.hpp"

namespace nv{

void print_ast(ast::AST *root){
    if(root == NULL) return;
    switch(root->id){
        case ast::BINOP:
            std::cout << root->token->attr << std::endl;
            print_ast(root->nodes[0]); 
            print_ast(root->nodes[1]); 
            break;
        case ast::NUM:
            std::cout << root->token->attr << std::endl;
            break;
    }
}

const char *tok_to_str(tk::Token *token){
    std::string *out = new std::string;
    out->append("<{");
    out->append(std::to_string(token->id));
    out->append("},{");
    out->append(token->attr);
    out->append("}>\n");
    return out->c_str();
}

}
