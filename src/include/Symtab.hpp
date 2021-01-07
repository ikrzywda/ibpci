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
    NUM, ARR_N, STACK_N, QUEUE_N, 
    STRING, ARR_STR, STACK_STR, QUEUE_STR,
    STACK, QUEUE, METHOD, PARAM
};

typedef std::vector<unsigned> dimensions;
typedef std::vector<std::string> data_str;
typedef std::vector<double> data_num;

class Reference{
private:
public:
    Reference();
    Reference(dimensions *d, data_str *dt);
    Reference(dimensions *d, data_num *dt);
    void push_dimension(int d);
    void push_data(std::string d);
    void push_data(double d);
    void set_type(int type);
    std::string type_to_str();
    void print_reference();
    int type;
    bool is_num;
    dimensions dim;
    data_str d_str;
    data_num d_num;
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
    Reference *lookup_ref(std::string scope, std::string key);
    double lookup_n(std::string scope, std::string key);
    double lookup_s(std::string scope, std::string key);
    bool is_logged(std::string scope, std::string key);
    void print_symtab();
};

}
#endif
