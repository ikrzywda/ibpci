#include "include/Symtab.hpp"

namespace sym{

Symtab::Symtab(const char *name){
    scope_name = name;
}

Reference *NewReference(int type, ast::AST *root){
    Reference *new_ref = new Reference;
    new_ref->type = type;
    new_ref->root = root;
    return new_ref;
}

int Symtab::does_sym_exist(Symtab *table, const char *key){
    std::map<const char*, Reference*>::const_iterator it = table->symbols.find(key);
    return it != table->symbols.end();
}

void Symtab::insert_symbol(Symtab *table, const char *key, Reference *ref){
    std::map<const char*, Reference*> temp; 
    if(does_sym_exist(table, key)){
        temp = {{key, ref}};
        table->symbols.swap(temp);
    }else{
        table->symbols.emplace(key, ref);
    }
}

void print_symtab(Symtab *table){
    std::map<const char*, Reference*>::iterator it;
    for(it = table->symbols.begin(); it != table->symbols.end(); ++it){
        std::cout << "{" << it->first <<
            "} : {" << it->second->type << std::endl <<
            "TREE:";
        ast::print_tree(it->second->root, 0); 
    }
}

ast::AST *get_root(Symtab *table, const char *key){
    return table->symbols.at(key)->root;
}

}
