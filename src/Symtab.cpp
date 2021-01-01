#include "include/Symtab.hpp"
namespace sym{

// TO-DO:
//  * insert symbols to symbol table
//  * check for duplicates of symbols
//  * check for duplicates of scopes (method names)

Symtab::Symtab(){
    scopes.insert(std::make_pair("GLOBAL", std::unique_ptr<symtab>(new symtab)));
}

void Symtab::new_scope(std::string name){
    scopes.insert(std::make_pair(name, std::unique_ptr<symtab>(new symtab)));
}

void Symtab::insert(std::string scope, std::string key, ast::AST *root){
    symtab *sm = scopes[scope].get();
    symtab::iterator it_sm = sm->find(key);
    if(it_sm == sm->end()){
        sm->insert(std::make_pair(key, root));
    }else{
        std::cout << "Key exists\n";
        exit(1);
    }
}

void Symtab::print_symtab(){
    symtab *sm;
    scope::iterator it_sc;
    symtab::iterator it_sm;
    for(it_sc = scopes.begin(); it_sc != scopes.end(); ++it_sc){
        std::cout << it_sc->first
                  << " : "
                  << &it_sc->second
                  << std::endl;
        sm = it_sc->second.get();
        for(it_sm = sm->begin(); it_sm != sm->end(); ++it_sm){
            std::cout << it_sm->first 
                      << " : "
                      << &it_sm->second
                      << std::endl;
        }
    }
}

ast::AST *Symtab::lookup(std::string scope, std::string key){
    symtab *sm = scopes[scope].get();
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        return it_sm->second;
    }else{
        std::cout << "Key does not exist\n";
        exit(1);
    }

}

void test_table(){
    Symtab s;
    s.new_scope("method1");
    s.new_scope("method2");
    s.new_scope("method3");
    s.new_scope("method4");
    s.insert("method1", "A", NULL);
    s.print_symtab();
}

}
