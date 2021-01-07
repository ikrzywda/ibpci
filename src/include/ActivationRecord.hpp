#ifndef ACTIVATION_RECORD_HPP
#define ACTIVATION_RECORD_HPP

#include "AST.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

namespace ar{

class Reference{
private:
    int type;
    double val_num;
    std::string val_str;
public:
    Reference(double val);
    Reference(std::string val);
    void set_value(double val);
    void set_value(std::string val);
    void print();
};

typedef std::unordered_map<std::string, std::unique_ptr<Reference>> data;

class AR{
private:
    ast::AST *root;
    data contents;   
    std::string name;
public:
    AR(std::string name, ast::AST *root);
    void insert(std::string key, double val);
    void insert(std::string key, std::string val);
    void print();
};

}

#endif
