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
    if(symtab.is_logged(scope, root->nodes[0]->attr)){
        return false;
    }else{
        switch(root->nodes[1]->id){
            case ast::ARR:
                symtab.insert(scope, root->nodes[0]->attr, populate_arr(root->nodes[1]));
                break;
            case ast::NUM:
                symtab.insert(scope, root->nodes[0]->attr, populate_var(root->nodes[1], sym::NUM));
                break;
            case ast::STRING:
                symtab.insert(scope, root->nodes[0]->attr, populate_var(root->nodes[1], sym::STRING));
                break;
            case ast::BINOP:
                break;
        }
        return true;
    }
}

sym::Reference *IBPCC::populate_var(ast::AST *root, int type){
    sym::Reference *ref = new sym::Reference;  
    ref->set_type(type);
    ref->push_dimension(1);
    ref->push_data(root->attr);
    return ref;
}

sym::Reference *IBPCC::populate_arr(ast::AST *root){
    sym::Reference *ref = new sym::Reference;  
    get_array_template(root, ref);
    get_contents(root, 0, ref);
    ref->set_type(ref->type == ast::NUM ? sym::ARR_N : sym::ARR_STR);
    return ref;
}

void IBPCC::get_array_template(ast::AST *root, sym::Reference *ref){
    while(root->id == ast::ARR){
        ref->push_dimension(root->nodes.size());
        root = root->nodes[0];
    }
    if(root != NULL)
        ref->set_type(root->id);
}

void IBPCC::get_contents(ast::AST *root, unsigned nesting, sym::Reference *ref){
    if(root == NULL) return;
    if(nesting > root->nodes.size()){
        if(root->id != ref->type){
                // ERROR MESSAGE
                std::cout << "Non-compatible types\n";
                exit(1);
        }
        ref->push_data(root->attr);
    }else if(ref->dim[nesting] == root->nodes.size()){
        for(const auto &a : root->nodes){
            get_contents(a, nesting + 1, ref); 
        }
    }else{
        // ERROR MESSAGE
        std::cout << "Ragged array\n";
        exit(1);
    }
}

void IBPCC::log_method(ast::AST *root){

}

}
