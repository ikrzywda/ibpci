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
        tk::Token *current_token;
        void eat(int token_id);
        ast::AST *expr();
        ast::AST *term();
        ast::AST *factor();
    public:
        Parser(const lxr::Lexer &lexer);
        ast::AST *parse();
};

}

#endif
