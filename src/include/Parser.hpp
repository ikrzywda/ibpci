#ifndef PARSER_HPP
#define PARSER_HPP

#include "Lexer.hpp"
#include "AST.hpp"
#include "Token.hpp"
#include "NodeVisitor.hpp"
#include <iostream>
#include <string>
#include <cstring>

namespace prs{

class Parser{
    private:
        lxr::Lexer lex;
        tk::Token *tok_curr;
        tk::Token tok_prev;
        tk::Token *lookahead();
        void eat(int token_id);
        ast::AST *statement();
        ast::AST *basic_statement();
        ast::AST *assign();
        ast::AST *expr();
        ast::AST *term();
        ast::AST *factor();
    public:
        Parser(const lxr::Lexer &lexer);
        ast::AST *parse();
};

}

#endif
