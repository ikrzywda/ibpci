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

void Reference::print(){
    if(type == ast::NUM) std::cout << val_num << std::endl;
    else std::cout << val_str << std::endl;
}

AR::AR(std::string name, ast::AST *root){
    this->name = name; 
    this->root = root;
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

void AR::print(){
    std::cout << name << "\n======================================\n";
    for(auto &a : contents){
        std::cout << a.first << " : "; 
        a.second.get()->print();
    }
    std::cout << std::endl;
}

}
