#include "include/Symtab.hpp"
namespace sym{

// TO-DO:
//  * insert symbols to symbol table
//  * check for duplicates of symbols
//  * check for duplicates of scopes (method names)

Reference::Reference(dimensions *d, data *dt){
    for(const auto &i : (*d)){
        dim.push_back(i);
    }
    for(const auto &i : (*dt)){
        dat.push_back(i);
    }
    delete d; delete dt;
}

void Reference::print_reference(){
    std::cout << "DIMENSIONS: ";
    for(const auto &i : dim){
        std::cout << i << " x ";
    }
    std::cout << "\nCONTENTS:\n";
    for(const auto &i : dat){
        std::cout << i << ",";
    }
    std::cout << std::endl;
}

Symtab::Symtab(){
    scopes.insert(std::make_pair("GLOBAL", std::unique_ptr<symtab>(new symtab)));
}

void Symtab::new_scope(std::string name){
    scopes.insert(std::make_pair(name, std::unique_ptr<symtab>(new symtab)));
}

void Symtab::insert(std::string scope, std::string key, int type, dimensions *d, data *dt){
    symtab *sm = scopes[scope].get();
    symtab::iterator it_sm = sm->find(key);
    if(it_sm == sm->end()){
        sm->insert(std::make_pair(key, std::unique_ptr<Reference>(new Reference(d, dt))));
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
                      << ":\n";
            it_sm->second.get()->print_reference();
        }
    }
}

Reference *Symtab::lookup(std::string scope, std::string key){
    symtab *sm = scopes[scope].get();
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        return it_sm->second.get();
    }else{
        std::cout << "Key does not exist\n";
        exit(1);
    }

}

bool Symtab::is_logged(std::string scope, std::string key){
    symtab *sm = scopes[scope].get();
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        return true;
    }else{
        return false;
    }

}
void test_table(){
    Symtab s;
    dimensions *dm = new dimensions;
    data *dt = new data;
    dm->push_back(1);
    dm->push_back(2);
    dm->push_back(5);
    dt->push_back("Hello");
    dt->push_back("world");
    dt->push_back("!!!");
    s.new_scope("method1");
    s.new_scope("method2");
    s.new_scope("method3");
    s.new_scope("method4");
    s.insert("method3", "ARR", ARR_STR, dm, dt);
    s.print_symtab();
}

}
