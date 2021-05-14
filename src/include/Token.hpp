#ifndef TOKEN_HPP
#define TOKEN_HPP

#include <iostream>
#include <memory>
#include <string>
#include <map>

namespace IBPCI{

struct Token
{
    unsigned LINE_NUM;
    unsigned ID;
    double VAL_NUM;
    std::string VAL_STR;

    Token(unsigned line_num, unsigned id, double num);
    Token(unsigned line_num, unsigned id, std::string str);
    Token();

    void print();
};

enum id 
{
    END_OF_FILE,
    PLUS, MINUS, MULT, DIV_WOQ, DIV_WQ, MOD,
    LSQBR, RSQBR, LPAREN, RPAREN, QTMARK,
    LT, GT, LEQ, GEQ, DNEQ, EQ, IS,
    AND, OR, 
    DOT, COMMA,
    INT, FLOAT, NUM, STR, BOOL,
    ID_VAR, ID_METHOD,
    METHOD, RETURN,
    LOOP, FROM, TO, WHILE, UNTIL,
    IF, ELSE, THEN,
    END,
    NEW_ARR, NEW_QUEUE, NEW_STACK,
    LENGTH, GET_NEXT, POP, DEQUEUE, 
    HAS_NEXT, PUSH, ENQUEUE, IS_EMPTY,
    OUTPUT, INPUT
};


const std::map<std::string, int> RESERVED_KEYWORDS = {
    {"div", DIV_WQ},
    {"mod", MOD},
    {"AND", AND},
    {"OR", OR},
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
    {"length", LENGTH},
    {"getNext", GET_NEXT},
    {"hasNext", HAS_NEXT},
    {"push", PUSH},
    {"pop", POP},
    {"enqueue", ENQUEUE},
    {"dequeue", DEQUEUE},
    {"isEmpty", IS_EMPTY},
    {"Array", NEW_ARR},
    {"Stack", NEW_STACK},
    {"Queue", NEW_QUEUE}
};

int lookup_keyword(std::string lexeme);

}
#endif
