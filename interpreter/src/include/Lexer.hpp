#ifndef LEXER_HPP
#define LEXER_HPP

#include <cstring>
#include <fstream>
#include <iostream>
#include <string>

#include "Token.hpp"

namespace lxr {

int is_upcase();
const std::string noattr = "0";

class Lexer {
 private:
  tk::Token token;
  std::string input_buffer;
  std::string attr_buffer;
  int pos, len;
  char c;
  void error();
  void advance();
  void skip_whitespace();
  void skip_comment();
  tk::Token &number();
  tk::Token &id();
  tk::Token &string();
  tk::Token &op_eq(char ch);

 public:
  Lexer(std::string &&buffer);
  Lexer() = default;
  ~Lexer() = default;
  unsigned int line_num;
  tk::Token &get_next_token();
};

}  // namespace lxr

#endif
