#ifndef PARSER_HPP
#define PARSER_HPP

#include "Lexer.hpp"
#include "AST.hpp"
#include "Token.hpp"
#include <iostream>
#include <string>

namespace prs{

class Parser{
    private:
        lxr::Lexer lex;
        tk::Token token;
        tk::Token *lookahead();
        void eat(int token_id);
        void error(int token_id);
        ast::AST *stmt();
        ast::AST *block();
        ast::AST *if_block();
        ast::AST *method();
        ast::AST *ret();
        ast::AST *loop_whl();
        ast::AST *loop_for();
        ast::AST *if_stmt();
        ast::AST *else_stmt();
        ast::AST *elif_stmt();
        ast::AST *cond();
        ast::AST *cmp();
        ast::AST *assign();
        ast::AST *method_call();
        ast::AST *expr();
        ast::AST *term();
        ast::AST *factor();
        ast::AST *arr();
        ast::AST *arr_dyn();
        ast::AST *std_method();
        ast::AST *in_out();
    public:
        Parser(std::string &&buffer);
        ast::AST *parse();
};

}

#endif
