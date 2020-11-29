#ifndef AST_HPP
#define AST_HPP

#include "Token.hpp"
#include <iostream>
#include <string>
#include <vector>

namespace ast{

enum id{
    TOKEN,
    BIN_OP
};

class AST{
    public:
        int id;
        AST *left_node;
        AST *right_node;
        tk::Token *token;
        std::vector<AST*> children;
        AST(int id, AST *ln, tk::Token *tk, AST *rn);
        AST(tk::Token *tk);
};

std::string *id_to_str(AST *node);

void print_tree_in_ast(AST *root);

}
#endif
