#include "include/ibpcc.hpp"

namespace ibpcc{

IBPCC::IBPCC(ast::AST *root){
    populate_symtab(root);
}

void IBPCC::populate_symtab(ast::AST *root){
    unsigned i = 0;
    std::vector<unsigned> indeces;
    for(const auto &a : root->nodes){
        switch(a->id){
            case ast::ASSIGN:
                if(log_assignment("GLOBAL", a)) indeces.push_back(i);
                break;
            case ast::METHOD:
                log_method(root->nodes[i]); 
                break;
            default: break;
        }
        ++i;
    }
    reduce_symtab(root, &indeces);
    symtab.print_symtab();
}

void IBPCC::reduce_symtab(ast::AST *root, std::vector<unsigned> *indeces){
    unsigned offset = 0;
    for(unsigned i : *(indeces)){
        root->nodes.erase(root->nodes.begin() + (i - offset));
        ++offset;
    }
}

bool IBPCC::log_assignment(std::string scope, ast::AST *root){
    sym::dimensions *d = new sym::dimensions;
    sym::data *dt = new sym::data;
    if(symtab.is_logged(scope, root->nodes[0]->attr)){
        return false;
    }else{
        symtab.insert(scope, root->nodes[0]->attr, 0, d, dt);
        return true;
    }
}

void IBPCC::log_method(ast::AST *root){

}

}
