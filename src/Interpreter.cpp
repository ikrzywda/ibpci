#include "include/Interpreter.hpp"

namespace pci{

Interpreter::Interpreter(ast::AST *root){
    symtab_global = sym::NewSymtab(NULL, "GLOGAL"); 
    execute(root);
    sym::print_symtab(symtab_global);
}

void Interpreter::execute(ast::AST *root){
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        switch(root->nodes[i]->id){
            case ast::ASSIGN: assignment(root->nodes[i]); break;
            case ast::OUTPUT: output(root->nodes[i]); break;
        }
    }
}

void Interpreter::assignment(ast::AST *root){
    sym::Reference *ref = sym::NewReference(sym::VAR, root->nodes[1]);
    sym::insert_symbol(symtab_global, root->nodes[0]->attr, ref);
}

void Interpreter::output(ast::AST *root){
    std::string output;
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        switch(root->nodes[i]->id){
            case ast::BINOP: output = binop(root->nodes[i]);
            case ast::ID_VAR: 
                std::cout << "->" << symtab_global->symbols.at(root->nodes[i]->attr)->root;
                output = binop(symtab_global->symbols.at("A")->root);
                //output = binop(symtab_global->symbols.at(root->nodes[i]->attr)->root);
            case ast::STRING: output = root->nodes[i]->attr;
        }
    }
    std::cout << output << std::endl;
}

const char *Interpreter::binop(ast::AST *root){
    std::string out;
    switch(binop_find_type(root)){
        case ast::NUM: out = std::to_string(binop_num(root)); return out.c_str();
        case ast::STRING: return binop_str(root); 
    }
    exit(1);
    return out.c_str();
}

int Interpreter::binop_find_type(ast::AST *root){
    if(root->id != ast::BINOP) return root->id;
    switch(root->nodes[0]->id){
        case ast::ID_VAR: 
            if(sym::does_sym_exist(symtab_global, root->nodes[0]->attr)){
                binop_find_type(symtab_global->symbols.at(root->nodes[0]->attr)->root);
            }else{
                std::cout << "SEMANTIC ERROR: undefined reference to: " << root->nodes[0]->attr
                    << std::endl;
                exit(1);
            }
            break;
        case ast::NUM: return ast::NUM;
        case ast::STRING: return ast::STRING;
    }
    return -1;
}

const char *Interpreter::binop_str(ast::AST *root){
    if(root->id == ast::STRING) return root->attr;
    std::string out = "";
    if(root->op == tk::PLUS){
        out += binop_str(root->nodes[0]);
        out += binop_str(root->nodes[1]);
        return out.c_str();
    }else{
        std::cout << "SEMANTIC ERROR: illegal operation on strings: " << root->nodes[0]->attr
            << std::endl;
        exit(1);
    }
    return out.c_str();
}

float Interpreter::binop_num(ast::AST *root){
    return 0;
}

}
