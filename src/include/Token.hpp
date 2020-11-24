#ifndef TOKEN_HPP
#define TOKEN_HPP

#include <string>
#include <map>

namespace tk{

enum id{
    END_FILE,
    PLUS,
    MINUS,
    MULT,
    DIV,
    MOD,
    LSQBR,
    RSQBR,
    LPAREN,
    RPAREN,
    QTMARK,
    LT,
    GT,
    LEQ,
    GEQ,
    EQ,
    IS,
    DOT,
    COMMA,
    INT,
    FLOAT,
    STRING,
    ID_VAR,
    ID_METHOD,
    METHOD,
    RETURN,
    LOOP,
    FROM,
    TO,
    WHILE,
    UNTIL,
    IF,
    ELSE,
    END,
    OUTPUT
};

class Token{
    public:
        std::string *attr;
        int id;
        Token(int id, std::string *attr);
};

const std::map<std::string, int> RESERVED_KEYWORDS = {
    {"method", METHOD},
    {"return", RETURN},
    {"loop", LOOP},
    {"from", FROM},
    {"to", TO},
    {"while", WHILE},
    {"until", UNTIL},
    {"if", IF},
    {"else", ELSE},
    {"end", END},
    {"output", OUTPUT}
};

int lookup_keyword(std::string lexeme);

std::string *tok_to_str(Token *token);
   
std::string *id_to_str(int id);


}
#endif
