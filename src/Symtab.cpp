#include "include/Symtab.hpp"
namespace sym{

Reference::Reference(){}

Reference::Reference(dimensions *d, data_str *dt){
    for(const auto &i : (*d)){
        dim.push_back(i);
    }
    for(const auto &i : (*dt)){
        d_str.push_back(i);
    }
    delete d; delete dt;
}

Reference::Reference(dimensions *d, data_num *dt){
    for(const auto &i : (*d)){
        dim.push_back(i);
    }
    for(const auto &i : (*dt)){
        d_num.push_back(i);
    }
    delete d; delete dt;
}

void Reference::push_dimension(int d){
    dim.push_back(d);
}

void Reference::push_data(std::string d){
    if(is_num == false) d_str.push_back(d);
    else d_num.push_back(std::atof(d.c_str()));
}

void Reference::push_data(double d){
    d_num.push_back(d);
}

void Reference::set_type(int type){
    if(type < STRING) is_num = true;
    else if(type > QUEUE_N && type < METHOD) is_num = false;
    Reference::type = type;
}

std::string Reference::type_to_str(){
    switch(type){
        case NUM: return "NUMBER";
        case STRING: return "STRING";
        case ARR_N: return "ARRAY OF NUMBERS";
        case ARR_STR: return "ARRAY OF STRINGS";
        case STACK: return "EMPTY STACK";
        case STACK_N: return "STACK OF NUMBERS";
        case QUEUE: return "EMPTY QUEUE";
        case QUEUE_N: return "QUEUE OF NUMBERS";
        case PARAM: return "METHOD PARAMETER";
    }   
    return "???";
}

void Reference::print_reference(){
    std::cout << "\nDIMENSIONS: ";
    for(const auto &i : dim){
        std::cout << i << " ";
    }
    if(is_num == true){
        std::cout << "\nCONTENTS: ";
        for(const auto &i : d_num){
            std::cout << "|" << i;
        }
    }else{
        std::cout << "\nCONTENTS: ";  // DRI!!!
        for(const auto &i : d_str){
            std::cout << "|" << i;
        }
    }
    std::cout << "\nTYPE: " << type_to_str();
    std::cout << "\nNUM VECTOR ADDRESS: " << &d_num;
    std::cout << "\nNUM VECTOR SIZE: " << d_num.size();
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
            std::cout << "---------------------------------------------\n";
        }
    }
}

Reference *Symtab::lookup_ref(std::string scope, std::string key){
    symtab *sm = scopes.at(scope).get()->sym_ptr;
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        return it_sm->second.get();
    }else{
        std::cout << "Key does not exist\n";
        exit(1);
    }
}

double Symtab::lookup_n(std::string scope, std::string key){
    symtab *sm = scopes.at(scope).get()->sym_ptr;
    symtab::iterator it_sm = sm->find(key);
    if(it_sm != sm->end()){
        if(it_sm->second.get()->type == sym::NUM){
            return it_sm->second.get()->d_num.at(0);
        }else{ 
            std::cout << "Incompatible type\n";
            exit(1);
        }
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

}
