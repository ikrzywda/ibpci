#include "include/ActivationRecord.hpp"

namespace ar{

Reference::Reference(double val){
    type = ast::NUM;
    val_num = val;
}

Reference::Reference(std::string val){
    type = ast::STRING;
    val_str = val;
}
    
void Reference::set_value(double val){
    type = ast::NUM;
    val_num = val;
}

void Reference::set_value(std::string val){
    type = ast::STRING;
    val_str = val;
}

double Reference::get_num(){
    return val_num;
}

std::string Reference::get_str(){
    return val_str;
}

int Reference::get_type(){
    return type;
}

void Reference::print(){
    if(type == ast::NUM) std::cout << val_num << std::endl;
    else std::cout << val_str << std::endl;
}

AR::AR(std::string name, ast::AST *root){
    this->name = name; 
    this->root = root;
}

void AR::error_uref(std::string key, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->line_num
        << ": undefined reference to variable " << key << std::endl;
    exit(1);
}

void AR::error_itp(std::string key, int type, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->line_num
        << ": variable " << key 
        << " is of incompatible type " 
        << ast::id_to_str(type) << ", should be "
        << ast::id_to_str(type == ast::NUM ? ast::STRING : ast::NUM)
        <<std::endl;
    exit(1);
}

void AR::insert(std::string key, double val){
    if(contents.find(key) == contents.end()){
        contents[key] = std::make_unique<Reference>(Reference(val));
    }else{
        contents[key].get()->set_value(val);
    }
}

void AR::insert(std::string key, std::string val){
    if(contents.find(key) == contents.end()){
        contents[key] = std::make_unique<Reference>(Reference(val));
    }else{
        contents[key].get()->set_value(val);
    }
}

ast::AST *AR::lookup_root(){
    return root;
}

std::string AR::lookup_name(){
    return name;
}

double AR::lookup_num(std::string key, ast::AST *leaf){
    data::iterator it = contents.find(key);
    if(it != contents.end()){
        if(it->second.get()->get_type() == ast::NUM)
            return it->second.get()->get_num();
        else
            error_itp(key, ast::NUM, leaf);
    }else{
        error_uref(key, leaf);
    }
    return 0;
}

std::string AR::lookup_str(std::string key, ast::AST *leaf){
    data::iterator it = contents.find(key);
    if(it != contents.end()){
        if(it->second.get()->get_type() == ast::STRING)
            return it->second.get()->get_str();
        else
            error_itp(key, ast::STRING, leaf);
    }else{
        error_uref(key, leaf);
    }
    return 0;
}

int AR::lookup_type(std::string key, ast::AST *leaf){
    data::iterator it = contents.find(key);
    if(it != contents.end()){
            return it->second.get()->get_type();
    }else{
        error_uref(key, leaf);
    }
    return 0;
    
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
