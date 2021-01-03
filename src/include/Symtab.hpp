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
    NUM, STRING,
    ARR_N, ARR_STR, STACK, 
    QUEUE, METHOD, PARAM
};

typedef std::vector<unsigned> dimensions;
typedef std::vector<std::string> data;


class Reference{
private:
public:
    Reference();
    Reference(dimensions *d, data *dt);
    void push_dimension(int d);
    void push_data(std::string d);
    void set_type(int type);
    std::string type_to_str();
    void print_reference();
    int type;
    dimensions dim;
    data dat;
};

typedef std::unordered_map<std::string, std::unique_ptr<Reference>> symtab;

typedef struct Scope_Reference Scope_Reference;
struct Scope_Reference{
public:
    Scope_Reference(ast::AST *root);
    ast::AST *scope_root;
    symtab *sym_ptr;
};

typedef std::map<std::string, std::unique_ptr<Scope_Reference>> scope;

class Symtab{
private:
    scope scopes;
public:
    Symtab();
    void new_scope(std::string name, ast::AST *root);
    void insert(std::string scope, std::string key, Reference *ref);
    Reference *lookup(std::string scope, std::string key);
    bool is_logged(std::string scope, std::string key);
    void print_symtab();
};

void test_table();

}
#endif
