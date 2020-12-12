#include "include/Interpreter.hpp"

namespace pci{

Interpreter::Interpreter(ast::AST *root){
    symtab_global = sym::NewSymtab(NULL, "GLOGAL"); 
    assignment(root->nodes[0]);
    sym::print_symtab(symtab_global);
}

void Interpreter::execute(ast::AST *root){
    switch(root->id){
        case ast::ASSIGN: assignment(root); break;
        case ast::OUTPUT: output(root); break;
    }
}

void Interpreter::assignment(ast::AST *root){
    sym::Reference *ref = sym::NewReference(sym::VAR, root->nodes[1]);
    sym::insert_symbol(symtab_global, root->nodes[0]->attr, ref);
}

void Interpreter::output(ast::AST *root){

}

void Interpreter::input(ast::AST *root){

}

}
