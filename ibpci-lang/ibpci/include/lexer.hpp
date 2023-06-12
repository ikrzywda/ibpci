#ifndef LEXER_HPP
#define LEXER_HPP

#include <cstring>
#include <fstream>
#include <iostream>
#include <string>

#include "token.hpp"
#include "error.hpp"

namespace lxr {

const std::string noattr = "0";

class Lexer {
 private:
  tk::Token token;
  std::string input_buffer;
  std::string attr_buffer;
  Error current_error;
  bool error_flag {false};
  int pos, len;
  char c;

  void error();
  void set_error();
  void advance();
  void skip_whitespace();
  void skip_comment();
  tk::Token &number();
  tk::Token number_v2();
  tk::Token &id();
  tk::Token id_v2();
  tk::Token &string();
  tk::Token string_v2();
  tk::Token &op_eq(char ch);
  tk::Token op_eq_v2(char base_character);

 public:
  Lexer(std::string &&buffer);
  Lexer() = default;
  ~Lexer() = default;
  unsigned int line_num;
  tk::Token &get_next_token();
  
  int get_next_token_v2(tk::Token &token);
};

}  // namespace lxr

#endif
