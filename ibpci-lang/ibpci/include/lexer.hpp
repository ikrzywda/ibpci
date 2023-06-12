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
  std::string input_buffer;
  std::string attr_buffer;
  Error current_error;
  bool error_flag {false};
  int pos, len;
  char c;

  void set_error();
  void advance();
  void skip_whitespace();
  void skip_comment();
  tk::Token number();
  tk::Token id();
  tk::Token string();
  tk::Token equals_operator(char base_character);

 public:
  Lexer(std::string &&buffer);
  Lexer() = default;
  ~Lexer() = default;
  unsigned int line_num;
  Error get_error();
  
  int get_next_token(tk::Token &token);
  
};

}  // namespace lxr

#endif
