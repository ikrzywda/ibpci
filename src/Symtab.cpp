#include "include/Symtab.hpp"
namespace sym{

Reference::Reference(){}

Reference::Reference(dimensions *d, data *dt){
    for(const auto &i : (*d)){
        dim.push_back(i);
    }
    for(const auto &i : (*dt)){
        dat.push_back(i);
    }
    delete d; delete dt;
}

void Reference::push_dimension(int d){
    dim.push_back(d);
}

void Reference::push_data(std::string d){
    dat.push_back(d);
}

void Reference::set_type(int type){
    Reference::type = type;
}

std::string Reference::type_to_str(){
    switch(type){
        case NUM: return "NUMBER";
        case STRING: return "STRING";
        case ARR_N: return "ARRAY OF NUMBERS";
        case ARR_STR: return "ARRAY OF STRINGS";
        case STACK: return "STACK";
        case QUEUE: return "QUEUE";
        case PARAM: return "METHOD PARAMETER";
    }   
    return "???";
}

void Reference::print_reference(){
    std::cout << "\nDIMENSIONS: ";
    for(const auto &i : dim){
        std::cout << i << " ";
    }
    std::cout << "\nCONTENTS: ";
    for(const auto &i : dat){
        std::cout << "|" << i;
    }
    std::cout << "\nTYPE: " << type_to_str();
    std::cout << std::endl;
}


Scope_Reference::Scope_Reference(ast::AST *root){
    scope_root = root;
    sym_ptr = new symtab;
}

Symtab::Symtab(){
    scopes.insert(std::make_pair("GLOBAL", std::unique_ptr<Scope_Reference>(new Scope_Reference(NULL))));
}

void Symtab::new_scope(std::string name, ast::AST *root){
    scopes.insert(std::make_pair(name, std::unique_ptr<Scope_Reference>(new Scope_Reference(root))));
}

void Symtab::insert(std::string scope, std::string key, Reference *ref){
    symtab *sm = scopes.at(scope).get()->sym_ptr;
    symtab::iterator it_sm = sm->find(key);
    if(it_sm == sm->end()){
        sm->insert(std::make_pair(key, std::unique_ptr<Reference>(ref)));
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
        std::cout << "\n_____________________________________________\n"
                  << "SCOPE : " << it_sc->first
                  << "\nROOT IN AST : " << &it_sc->second->scope_root
                  << "\n=============================================\n";
        sm = it_sc->second.get()->sym_ptr;
        for(it_sm = sm->begin(); it_sm != sm->end(); ++it_sm){
            std::cout << "SYMBOL : " << it_sm->first;
            it_sm->second.get()->print_reference();
            std::cout << "-------------------------------------------\n";
        }
    }
}

Reference *Symtab::lookup(std::string scope, std::string key){
    symtab *sm = scopes.at(scope).get()->sym_ptr;
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        return it_sm->second.get();
    }else{
        std::cout << "Key does not exist\n";
        exit(1);
    }

}

bool Symtab::is_logged(std::string scope, std::string key){
    symtab *sm = scopes.at(scope).get()->sym_ptr;
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
    s.print_symtab();
}

}
