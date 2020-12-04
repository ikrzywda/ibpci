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
    STANDARD_METHOD
};

class Token{
    public:
        const char *attr;
        int id;
        Token(int id, std::string *attr);
        Token();
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
    {"output", OUTPUT},
    {"input", INPUT},
    {"length", STANDARD_METHOD},
    {"addItem", STANDARD_METHOD},
    {"getNext", STANDARD_METHOD},
    {"resetNext", STANDARD_METHOD},
    {"hasNext", STANDARD_METHOD},
    {"push",STANDARD_METHOD},
    {"pop", STANDARD_METHOD},
    {"enqueue", STANDARD_METHOD},
    {"dequeue", STANDARD_METHOD},
    {"isEmpty", STANDARD_METHOD},
};

int lookup_keyword(std::string lexeme);

std::string *tok_to_str(Token *token);
   
std::string *id_to_str(int id);


}
#endif
