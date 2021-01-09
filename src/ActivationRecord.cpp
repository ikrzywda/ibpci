#include "include/ActivationRecord.hpp"

namespace ar{


AR::AR(std::string name, ast::AST *root){
    this->name = name; 
    this->root = root;
}

void AR::error_uref(std::string key, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->token.line
        << ": undefined reference to variable " << key << std::endl;
    exit(1);
}

void AR::error_itp(std::string key, int type, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->token.line
        << ": variable " << key 
        << " is of incompatible type " 
        << ast::id_to_str(type) << ", should be "
        << ast::id_to_str(type == ast::NUM ? ast::STRING : ast::NUM)
        <<std::endl;
    exit(1);
}

void AR::insert(std::string key, ast::AST *root){
    if(contents.find(key) == contents.end()){
        contents[key] = std::make_unique<rf::Reference>(rf::Reference(root));
    }else{
        contents[key].get()->set_value(root);
    }
}

ast::AST *AR::lookup_root(){
    return root;
}

std::string AR::lookup_name(){
    return name;
}

tk::Token *AR::lookup(std::string key, ast::AST *leaf){
    data::iterator it = contents.find(key);
    if(it != contents.end())
        return it->second.get()->get_token();
    error_uref(key, leaf);
    return nullptr;
}

void AR::print(){
    std::cout << name << "\n======================================\n";
    for(auto &a : contents){
        std::cout << a.first << " : "; 
        a.second.get()->print();
    }
    std::cout << std::endl;
}

}
