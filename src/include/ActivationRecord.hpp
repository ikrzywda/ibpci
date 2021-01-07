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
    std::vector<int> size;
    double val_num;
    std::vector<double> container_num;
    std::string val_str;
    std::vector<std::string> container_str;
public:
    Reference(double val);
    Reference(std::string val);
    void set_value(double val);
    void set_value(std::string val);
    double get_num();
    std::string get_str();
    int get_type();
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
    void error_uref(std::string key, ast::AST *leaf);
    void error_itp(std::string key, int type, ast::AST *leaf);
    void insert(std::string key, double val);
    void insert(std::string key, std::string val);
    double lookup_num(std::string key, ast::AST *leaf);
    std::string lookup_str(std::string key, ast::AST *leaf);
    int lookup_type(std::string key, ast::AST *leaf);
    void print();
};

}

#endif
