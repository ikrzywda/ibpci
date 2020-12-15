#ifndef SYMTAB_HPP
#define SYMTAB_HPP

#include "Token.hpp"
#include "AST.hpp"
#include <map>
#include <vector>
#include <string>

namespace sym{

enum symbol_type{
    METHOD,
    VAR,
    ARRAY
};

typedef struct Reference Reference;
struct Reference{
    int type;
    ast::AST *root;
};

typedef struct Symtab Symtab;
struct Symtab{
    const char *scope_name;
    Symtab *parent_scope;
    std::map<const char*, Reference*> symbols;
};

Symtab *NewSymtab(Symtab *parent_scope, const char *name);

int does_sym_exist(Symtab *table, const char *key);

void insert_symbol(Symtab *table, const char *key, Reference *ref);

Reference *NewReference(int type, ast::AST *root);

void print_symtab(Symtab *table);

}

#endif
