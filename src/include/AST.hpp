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
    METHOD,
    RETURN,
    METHOD_CALL,
    PARAMS,
    WHILE,
    FOR,
    IF,
    ELSE,
    COND,
    CMP,
    ASSIGN,
    BINOP,
    UN_MIN,
    NUM,
    STRING,
    ID_VAR,
    ARR,
    ARR_DYN,
    ARR_ACC,
    STACK,
    QUEUE,
    STANDARD_METHOD,
    INPUT,
    OUTPUT
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

void free_node(AST *node);

void print_tree(AST *root, int offset);

}
#endif
