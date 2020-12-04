#ifndef AST_HPP
#define AST_HPP

#include "Token.hpp"
#include <iostream>
#include <string>
#include <vector>

namespace ast{

enum ast_id{
    BINOP,
    NUM
};

typedef struct AST AST;

struct AST{
    int id;
    tk::Token *token;
    std::vector<AST*> nodes;
};

AST *BinOp(AST *left_node, tk::Token *token, AST *right_node);

AST *Num(tk::Token *token);

}
#endif
