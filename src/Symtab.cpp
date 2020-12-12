#include "include/Symtab.hpp"

namespace sym{

Symtab *NewSymtab(Symtab *parent_scope, const char *name){
    return new Symtab;
}

Reference *NewReference(int type, ast::AST *root){
    Reference *new_ref = new Reference;
    new_ref->type = type;
    new_ref->root = root;
    return new_ref;
}

int does_sym_exit(Symtab *table, const char *key){
    std::map<const char*, Reference*>::const_iterator it = table->symbols.find(key);
    return it != table->symbols.end();
}

void insert_symbol(Symtab *table, const char *key, Reference *ref){
    std::map<const char*, Reference*> temp; 
    if(does_sym_exit(table, key)){
        temp = {{key, ref}};
        table->symbols.swap(temp);
    }else{
        table->symbols.emplace(key, ref);
    }
}

void print_symtab(Symtab *table){
    std::map<const char*, Reference*>::iterator it;
    for(it = table->symbols.begin(); it != table->symbols.end(); ++it){
        std::cout << "KEY : " << it->first <<
            "\nTYPE : " << it->second->type <<
            " POINTER : " << it->second->root->attr << std::endl;
    }
}

}
