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
        tk::Token *current_token;
        void eat(int token_id);
        ast::AST *method();
        ast::AST *statement();
        ast::AST *input();
        ast::AST *output();
        ast::AST *if_statement();
        ast::AST *loop();
        ast::AST *loop_for();
        ast::AST *loop_while();
        ast::AST *method_call();
        ast::AST *assignment();
        ast::AST *array_initialization();
        ast::AST *array_argument();
        ast::AST *array_element();
        ast::AST *comparison_list();
        ast::AST *comparison();
        ast::AST *expr();
        ast::AST *term();
        ast::AST *factor();
    public:
        Parser(const lxr::Lexer &lexer);
        void parse();
};

}

#endif
