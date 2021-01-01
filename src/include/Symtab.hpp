#ifndef SYMTAB_HPP
#define SYMTAB_HPP

#include "Token.hpp"
#include "AST.hpp"
#include <unordered_map>
#include <vector>
#include <string>
#include <memory>
#include <utility>

namespace sym{

enum types{
    INT, FLOAT, STRING,
    ARR_N, ARR_STR, STACK, 
    QUEUE, METHOD
};

typedef std::unordered_map<std::string, ast::AST*> symtab;
typedef std::map<std::string, std::unique_ptr<symtab>> scope;

class Symtab{
private:
    scope scopes;
public:
    Symtab();
    void new_scope(std::string name);
    void insert(std::string scope, std::string key, ast::AST *root);
    ast::AST *lookup(std::string scope, std::string key);
    void print_symtab();
};

void test_table();

}
#endif
