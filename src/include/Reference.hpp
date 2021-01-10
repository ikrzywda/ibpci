#ifndef REFERENCE_HPP
#define REFERENCE_HPP

#include "AST.hpp"
#include "Token.hpp"
#include <iostream>
#include <string>
#include <vector>

namespace rf{

class Reference{
private:
    unsigned size;
    tk::Token token;
public:
    Reference(ast::AST *terminal);
    Reference(tk::Token *terminal);
    void set_value(ast::AST *terminal);
    void set_value(tk::Token *terminal);
    tk::Token *get_token();
    void print();
};

}

#endif
