#ifndef AST_HPP
#define AST_HPP

#include "Token.hpp"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <string>
#include <vector>

namespace ast{

enum ast_id{
    START, BLOCK,
    METHOD, METHOD_CALL, PARAM, RETURN,
    WHILE, FOR, RANGE,
    IF, ELSE, ELIF, 
    ASSIGN,
    BINOP, UN_MIN, COND, CMP,
    NUM, STRING, 
    ID,
    ARR, ARR_DYN, ARR_ACC,
    STACK, QUEUE,
    STD_RETURN, STD_VOID, INPUT, OUTPUT
};

class AST{
public:
    int id;
    tk::Token token;
    bool is_terminal;
    std::string non_terminal;
    std::vector<AST*> children;
    AST(tk::Token &token, int node_id);
    AST(int node_id);
    void push_child(AST *child);
};

void print_tree(AST *root, int offset);

void delete_tree(AST *root);

std::string id_to_str(int id);

}
#endif
