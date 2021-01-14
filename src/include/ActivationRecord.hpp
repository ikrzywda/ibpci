#ifndef ACTIVATION_RECORD_HPP
#define ACTIVATION_RECORD_HPP

#include "AST.hpp"
#include "Reference.hpp"
#include "Token.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

namespace ar{

typedef std::unordered_map<std::string, std::unique_ptr<rf::Reference>> data;

class AR{
private:
    ast::AST *root;
    data contents;   
    std::string name;
public:
    AR(std::string name, ast::AST *root);
    void error_uref(std::string key, ast::AST *leaf);
    void error_itp(std::string key, int type, ast::AST *leaf);
    void insert(std::string key, rf::Reference *terminal);
    void insert(std::string key, ast::AST *root);
    void insert(std::string key, tk::Token *terminal);
    void mutate_array(std::string key, unsigned address, rf::Reference *terminal);
    rf::Reference *lookup(std::string key, ast::AST *leaf);
    ast::AST *lookup_root();
    std::string lookup_name();
    void print();
};

}

#endif
