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
    Reference() = default;
    ~Reference() = default;
    Reference(const Reference&) = default;
    Reference(Reference&&) = default;
    void set_value(ast::AST *terminal);
    tk::Token *get_token();
    void print();
};

}

#endif
