#include "include/ibpcc.hpp"

namespace ibpcc{

IBPCC::IBPCC(ast::AST *root){
    populate_symtab("GLOBAL", root);
    symtab.print_symtab();
}

void IBPCC::populate_symtab(std::string scope_name, ast::AST *root){
    unsigned i = 0;
    std::vector<unsigned> indeces;
    for(const auto &a : root->nodes){
        if(scope_name == "GLOBAL" && a->id == ast::METHOD) log_method(a); // ADD ERROR!!!!
        if(scope_name != "GLOBAL" && a->id == ast::PARAMS){ 
            log_params(root->attr, root);
            indeces.push_back(i);
        }
        switch(a->id){
            case ast::ASSIGN:
                if(log_assignment(scope_name, a)) indeces.push_back(i);
                break;
            default: break;
        }
        ++i;
    }
    reduce_symtab(root, &indeces);
}

void IBPCC::reduce_symtab(ast::AST *root, std::vector<unsigned> *indeces){
    unsigned offset = 0;
    for(unsigned i : *(indeces)){
        root->nodes.erase(root->nodes.begin() + (i - offset));
        ++offset;
    }
}

bool IBPCC::log_assignment(std::string scope_name, ast::AST *root){
    if(symtab.is_logged(scope_name, root->nodes[0]->attr)){
        return false;
    }else{
        switch(root->nodes[1]->id){
            case ast::ARR:
                symtab.insert(scope_name, root->nodes[0]->attr, populate_arr(root->nodes[1]));
                break;
            case ast::NUM:
                symtab.insert(scope_name, root->nodes[0]->attr, populate_var(root->nodes[1], sym::NUM));
                break;
            case ast::STRING:
                symtab.insert(scope_name, root->nodes[0]->attr, populate_var(root->nodes[1], sym::STRING));
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
    symtab.new_scope(root->attr, root); 
    populate_symtab(root->attr, root);
}

void IBPCC::log_params(std::string scope_name, ast::AST *root){
    sym::Reference *ref;
    for(const auto &a : root->nodes[0]->nodes){
        if(!symtab.is_logged(scope_name, a->attr)){
            ref = new sym::Reference;
            ref->set_type(sym::PARAM);
            symtab.insert(scope_name, a->attr, ref);
        }else{
            std::cout << "duplicate parameter name";
            exit(1);
        }
    }
}

}
