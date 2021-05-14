#ifndef LEXER_HPP
#define LEXER_HPP

#include "Token.hpp"
#include "IBPCI.hpp"

#include <iostream>
#include <fstream>
#include <string>
#include <cstring>

namespace IBPCI 
{

bool is_upcase(char c);

class Lexer : public RunTime
{
        unsigned line_num {0};
        unsigned long pos {0};
        char c;

        void error();
        void advance();
        void skip_whitespace();
        void skip_comment();
        Token number();
        Token id();
        Token string();
        Token op_eq(char ch);

    public:
        using RunTime::RunTime;
        Token get_next_token();
        void print_all_tokens();
};

}

#endif
