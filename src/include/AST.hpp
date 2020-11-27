#ifndef AST_HPP
#define AST_HPP

#include "Token.hpp"
#include <iostream>
#include <string>

namespace ast{

class AST{
    public:
        AST *left_node;
        AST *right_node;
        tk::Token *token;
        AST(AST *left_node, tk::Token *token, AST *right_node);
};

void print_AST(AST *node);

}

#endif
