#ifndef LEXER_HPP
#define LEXER_HPP

#include <iostream>
#include <fstream>
#include <string>
#include "Token.hpp"
#include "Alphabet.hpp"

namespace lxr{

class Lexer{
    private:
        std::string *input_buffer;
        std::string *attr_buffer;
        std::string noattr = "0";
        int pos;
        char c;
        void advance();
        void empty_attr_buffer(std::string *str);
        tk::Token *advance_with(char ch);
        tk::Token *number();
        tk::Token *id();
        tk::Token *id_method();
        tk::Token *op_eq(char ch);
    public:
        Lexer(std::string *buffer);
        tk::Token *get_next_token();
};

}

#endif
