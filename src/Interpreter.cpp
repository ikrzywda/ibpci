#include "include/Interpreter.hpp"

namespace pci{

std::map<std::string, ast::AST*> global_scope;


Reference::Reference(int tp, ast::AST *rt){
    type = tp;
    root = rt;
}

void print_table(){
    std::map<std::string, ast::AST*>::iterator it;
    for(it = global_scope.begin(); it != global_scope.end(); ++it){
        std::cout << "{" << it->first;
        ast::print_tree(it->second, 0); 
    }
}

void execute(ast::AST *root){
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        switch(root->nodes[i]->id){
            case ast::OUTPUT: output(root->nodes[i]); break;
            case ast::ASSIGN: assignment(root->nodes[i]); break;
        }
    }
    print_table();
}

void assignment(ast::AST *root){
    global_scope[root->nodes[0]->attr] = root->nodes[1];
}

void output(ast::AST *root){
    std::string out;
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        switch(root->nodes[i]->id){
            case ast::BINOP: 
                out += std::to_string(binop(root->nodes[i])) + " "; break;
            case ast::ID_VAR: 
                out += std::to_string(binop(global_scope.at(root->nodes[i]->attr))) + " "; 
                break;

        }
    }
    std::cout << out;
}

float binop(ast::AST *root){
    if(root == NULL) return 1;
    if(root->id == ast::NUM){
        return std::atof(root->attr);
    }else if(root->id == ast::ID_VAR){
        return binop(global_scope.at(root->attr));
    }else if(root->id == ast::BINOP){
        switch(root->op){
            case tk::PLUS:
                return binop(root->nodes[0]) + binop(root->nodes[1]);
            case tk::MINUS:
                return binop(root->nodes[0]) - binop(root->nodes[1]);
            case tk::MULT:
                return binop(root->nodes[0]) * binop(root->nodes[1]);
            case tk::DIV_WQ:
                return binop(root->nodes[0]) / binop(root->nodes[1]);
            default: break;
        }
    }
    return 0;
}

}
