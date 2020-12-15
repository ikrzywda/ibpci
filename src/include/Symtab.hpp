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

class Symtab{
    public:
        const char *scope_name;
        Symtab *parent_scope;
        std::map<const char*, Reference*> symbols;
        Symtab(const char *name);
        void insert_symbol(Symtab *table, const char *key, Reference *ref);
        int does_sym_exist(Symtab *table, const char *key);
        void print_symtab(Symtab *table);
};

Symtab *NewSymtab(Symtab *parent_scope, const char *name);



Reference *NewReference(int type, ast::AST *root);


ast::AST *get_root(Symtab *table, const char *key);

void test(Symtab *table);

}

#endif
