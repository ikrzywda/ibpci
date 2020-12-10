#ifndef SYMTAB_HPP
#define SYMTAB_HPP

#include "Token.hpp"
#include <map>
#include <vector>
#include <string>

namespace sym{

enum symbol_type{
    METHOD,
    VARIABLE,
    ARRAY
};

typedef struct Symbol Symbol;
struct Symbol{
    int type;
    std::vector<tk::Token*> values;
};

typedef struct Symtab Symtab;
struct Symtab{
    std::string *scope_name;
    Symtab *parent_scope;
    std::map<std::string*, Symbol*> symbols;
};

Symtab *NewSymtab(Symtab *parent_scope, std::string *name);

void set_symbol(std::string id, int type);

void check_cast(std::string id, int new_type);

}

#endif
