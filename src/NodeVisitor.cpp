#include "include/NodeVisitor.hpp"

namespace nv{

float visit_expr(ast::AST *root){
    if(root == NULL) return 0;
    if(root->id == ast::BINOP){
        switch(root->op){
            case tk::PLUS:
                return visit_expr(root->nodes[0]) + visit_expr(root->nodes[1]);
            case tk::MINUS:
                return visit_expr(root->nodes[0]) - visit_expr(root->nodes[1]);
            case tk::MULT:
                return visit_expr(root->nodes[0]) * visit_expr(root->nodes[1]);
            case tk::DIV_WOQ:
                return visit_expr(root->nodes[0]) / visit_expr(root->nodes[1]);
            case tk::MOD:
                return (int)visit_expr(root->nodes[0]) % (int)visit_expr(root->nodes[1]);
        }
    }else if(root->id == ast::NUM){
        return std::stod(root->attr);
    }
    return 0;
}

}
