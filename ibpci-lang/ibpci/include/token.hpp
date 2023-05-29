#ifndef TOKEN_HPP
#define TOKEN_HPP

#include <iostream>
#include <map>
#include <memory>
#include <string>

namespace tk {

enum id {
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
  DNEQ,
  EQ,
  IS,
  AND,
  OR,
  DOT,
  COMMA,
  INT,
  FLOAT,
  NUM,
  STRING,
  BOOL,
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
  THEN,
  END,
  NEW_ARR,
  NEW_QUEUE,
  NEW_STACK,
  LENGTH,
  GET_NEXT,
  POP,
  DEQUEUE,
  HAS_NEXT,
  PUSH,
  ENQUEUE,
  IS_EMPTY,
  OUTPUT,
  INPUT
};

class Token {
 public:
  Token(std::string val);
  Token(double val);
  Token(Token &tok);
  Token(Token *tok);
  Token() = default;
  ~Token() = default;

  int id, op;
  double val_num;
  std::string val_str;
  unsigned line;
  void mutate(int id, std::string val, unsigned ln);
  void mutate(int id, double val, unsigned ln);
  void print();

  Token operator+(Token &t);
};

const std::map<std::string, int> RESERVED_KEYWORDS = {{"div", DIV_WQ},
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
                                                      {"Queue", NEW_QUEUE}};

int lookup_keyword(std::string lexeme);

void print_token(Token *token);

std::string id_to_str(int id);

}  // namespace tk
#endif
