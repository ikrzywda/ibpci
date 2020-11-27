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
    DIV_WOQ,
    DIV_WQ,
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
    AND,
    OR,
    NOT,
    METHOD,
    RETURN,
    LOOP,
    FROM,
    TO,
    WHILE,
    UNTIL,
    IF,
    ELSE,
    THEN,
    END,
    OUTPUT,
    INPUT,
    STANDARD_METHOD,
    STANDARD_METHOD_ATTR
};

class Token{
    public:
        std::string *attr;
        int id;
        Token(int id, std::string *attr);
};

const std::map<std::string, int> RESERVED_KEYWORDS = {
    {"div", DIV_WQ},
    {"mod", MOD},
    {"AND", AND},
    {"OR", OR},
    {"NOT", NOT},
    {"method", METHOD},
    {"return", RETURN},
    {"loop", LOOP},
    {"from", FROM},
    {"to", TO},
    {"while", WHILE},
    {"until", UNTIL},
    {"if", IF},
    {"else", ELSE},
    {"then", THEN},
    {"end", END},
    {"output", STANDARD_METHOD},
    {"input", STANDARD_METHOD},
    {"addItem", STANDARD_METHOD_ATTR},
    {"getNext", STANDARD_METHOD_ATTR},
    {"resetNext", STANDARD_METHOD_ATTR},
    {"hasNext", STANDARD_METHOD_ATTR},
    {"push",STANDARD_METHOD_ATTR},
    {"pop", STANDARD_METHOD_ATTR},
    {"enqueue", STANDARD_METHOD_ATTR},
    {"dequeue", STANDARD_METHOD_ATTR},
    {"isEmpty", STANDARD_METHOD_ATTR},
    {"length", STANDARD_METHOD_ATTR}
};

int lookup_keyword(std::string lexeme);

std::string *tok_to_str(Token *token);
   
std::string *id_to_str(int id);


}
#endif
