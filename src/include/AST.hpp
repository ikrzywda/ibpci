#ifndef AST_HPP
#define AST_HPP

#include "Token.hpp"
#include <iostream>
#include <sstream>
#include <iomanip>
#include <string>
#include <vector>

namespace ast{

enum ast_id{
    START,
    IF,
    COND,
    CMP,
    ASSIGN,
    BINOP,
    NUM,
    ID_VAR
};

typedef struct AST AST;

struct AST{
    int id;
    int op;
    const char *attr;
    std::vector<AST*> nodes;
};

AST *NewNode(int node_id, const char *attr);

AST *populate_by_attr(AST *parent, int id, const char *attr);

AST *populate_by_node(AST *parent, AST *child);

void print_tree(AST *root, int offset);

}
#endif
