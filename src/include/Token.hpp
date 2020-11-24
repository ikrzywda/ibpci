#ifndef TOKEN_HPP
#define TOKEN_HPP

#include <string>

namespace tk{

enum id{
    END,
    PLUS,
    MINUS,
    MULT,
    DIV,
    MOD,
    LSQBR,
    RSQBR,
    LPAREN,
    RPAREN,
    LT,
    GT,
    LEQ,
    GEQ,
    EQ,
    IS,
    DOT,
    COMMA,
    ID_VAR,
    ID_METHOD,
    INT,
    FLOAT,
    STRING,
};

class Token{
    public:
        std::string *attr;
        int id;
        Token(int id, std::string *attr);
};

std::string *tok_to_str(Token *token);
   
std::string *id_to_str(int id);
}
#endif
