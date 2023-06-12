#include "../include/lexer.hpp"

namespace lxr {

Lexer::Lexer(std::string &&buffer) : input_buffer(buffer) {
  token = tk::Token();
  pos = 0, len = buffer.size();
  c = input_buffer.at(pos);
  line_num = 1;
}

int is_upcase(char c) {
  return (c >= 'A' && c <= 'Z') || isdigit(c) || c == '_' ? 1 : 0;
}

void Lexer::error() {
  std::cout << "Unexpected character at line " << line_num << ": '" << c
            << "'\n";
  exit(1);
}

void Lexer::set_error() {
  current_error.message = "Unexpected character at line " + std::to_string(line_num) +
                  ": '" + c + "'\n";
  current_error.line_num = line_num;
  current_error.type = ErrorType::LEXER;
  error_flag = true;
}

void Lexer::advance() {
  pos++;
  if (pos < len - 1) {
    c = input_buffer.at(pos);
  } else {
    c = EOF;
  }
}

void Lexer::skip_whitespace() {
  while (c == ' ' || c == '\t' || c == '\v' || c == '\f') {
    advance();
  }
}

void Lexer::skip_comment() {
  while (c != '\n') {
    advance();
  }
}

tk::Token &Lexer::number() {
  int id = tk::INT;
  std::string buffer;
  buffer.push_back(c);
  advance();
  while (std::isdigit(c) || c == '.') {
    if (c == '.' && id == tk::FLOAT) break;
    if (c == '.') id = tk::FLOAT;
    buffer.push_back(c);
    advance();
  }
  token.mutate(tk::NUM, std::stod(buffer), line_num);
  return token;
}

tk::Token Lexer::number_v2() {
  int id = tk::INT;
  std::string buffer;
  buffer.push_back(c);
  advance();
  while (std::isdigit(c) || c == '.') {
    if (c == '.' && id == tk::FLOAT) break;
    if (c == '.') id = tk::FLOAT;
    buffer.push_back(c);
    advance();
  }
  return tk::Token(tk::NUM, std::stod(buffer), line_num);
}

tk::Token &Lexer::id() {
  int id = tk::ID_VAR;
  attr_buffer.push_back(c);
  if (!is_upcase(c)) id = tk::ID_METHOD;
  advance();
  while (std::isalnum(c) || c == '_') {
    if (!is_upcase(c)) id = tk::ID_METHOD;
    attr_buffer.push_back(c);
    advance();
  }
  if (tk::lookup_keyword(attr_buffer) > 0) id = tk::lookup_keyword(attr_buffer);
  token.mutate(id, attr_buffer, line_num);
  return token;
}

tk::Token Lexer::id_v2() {
  int id = tk::ID_VAR;
  int keyword_id = 0;
  attr_buffer.push_back(c);
  if (!is_upcase(c)) {
    id = tk::ID_METHOD;
  }
  advance();
  while (std::isalnum(c) || c == '_') {
    if (!is_upcase(c)) {
      id = tk::ID_METHOD;
    }
    attr_buffer.push_back(c);
    advance();
  }
  keyword_id = tk::lookup_keyword(attr_buffer);
  id = keyword_id > 0 ? keyword_id : id;
  return tk::Token(id, attr_buffer, line_num);
}

tk::Token &Lexer::string() {
  advance();
  while (c != '\"' && c != EOF) {
    attr_buffer.push_back(c);
    advance();
  }
  advance();
  token.mutate(tk::STRING, attr_buffer, line_num);
  return token;
}

tk::Token Lexer::string_v2() {
  advance();
  while (c != '\"' && c != EOF) {
    attr_buffer.push_back(c);
    advance();
  }
  advance();
  return tk::Token(tk::STRING, attr_buffer, line_num);
}

tk::Token &Lexer::op_eq(char ch) {
  advance();
  if (c == '=') {
    switch (ch) {
      case '=':
        advance();
        attr_buffer = "==";
        token.mutate(tk::IS, attr_buffer, line_num);
        return token;
      case '<':
        advance();
        attr_buffer = "<=";
        token.mutate(tk::LEQ, attr_buffer, line_num);
        return token;
      case '>':
        advance();
        attr_buffer = ">=";
        token.mutate(tk::GEQ, attr_buffer, line_num);
        return token;
      case '!':
        advance();
        attr_buffer = "!=";
        token.mutate(tk::DNEQ, attr_buffer, line_num);
        return token;
    }
  } else {
    switch (ch) {
      case '=':
        attr_buffer = "=";
        token.mutate(tk::EQ, attr_buffer, line_num);
        return token;
      case '<':
        attr_buffer = "<";
        token.mutate(tk::LT, attr_buffer, line_num);
        return token;
      case '>':
        attr_buffer = ">";
        token.mutate(tk::GT, attr_buffer, line_num);
        return token;
    }
  }
  return token;
}

tk::Token Lexer::op_eq_v2(char base_character) {
  advance();
  if (c == '=') {
    switch (base_character) {
      case '=':
        advance();
        attr_buffer = "==";
        return tk::Token(tk::IS, attr_buffer, line_num);
      case '<':
        advance();
        attr_buffer = "<=";
        return tk::Token(tk::LEQ, attr_buffer, line_num);
      case '>':
        advance();
        attr_buffer = ">=";
        return tk::Token(tk::GEQ, attr_buffer, line_num);
      case '!':
        advance();
        attr_buffer = "!=";
        return tk::Token(tk::DNEQ, attr_buffer, line_num);
    }
  } else {
    switch (base_character) {
      case '=':
        attr_buffer = "=";
        return tk::Token(tk::EQ, attr_buffer, line_num);
      case '<':
        attr_buffer = "<";
        return tk::Token(tk::LT, attr_buffer, line_num);
      case '>':
        attr_buffer = ">";
        return tk::Token(tk::GT, attr_buffer, line_num);
    }
  }
  set_error();
  return tk::Token();
}

tk::Token &Lexer::get_next_token() {
  while (1) {
    skip_whitespace();
    attr_buffer.clear();
    if (std::isdigit(c)) {
      return number();
    } else if (std::isalnum(c)) {
      return id();
    } else {
      switch (c) {
        case '+':
          advance();
          attr_buffer = "+";
          token.mutate(tk::PLUS, attr_buffer, line_num);
          return token;
        case '-':
          advance();
          attr_buffer = "-";
          token.mutate(tk::MINUS, attr_buffer, line_num);
          return token;
        case '*':
          advance();
          attr_buffer = "*";
          token.mutate(tk::MULT, attr_buffer, line_num);
          return token;
        case '%':
          advance();
          attr_buffer = "%";
          token.mutate(tk::MOD, attr_buffer, line_num);
          return token;
        case '[':
          advance();
          attr_buffer = "]";
          token.mutate(tk::LSQBR, attr_buffer, line_num);
          return token;
        case ']':
          advance();
          attr_buffer = "]";
          token.mutate(tk::RSQBR, attr_buffer, line_num);
          return token;
        case '(':
          advance();
          attr_buffer = "(";
          token.mutate(tk::LPAREN, attr_buffer, line_num);
          return token;
        case ')':
          advance();
          attr_buffer = ")";
          token.mutate(tk::RPAREN, attr_buffer, line_num);
          return token;
        case '.':
          advance();
          attr_buffer = ".";
          token.mutate(tk::DOT, attr_buffer, line_num);
          return token;
        case ',':
          advance();
          attr_buffer = ",";
          token.mutate(tk::COMMA, attr_buffer, line_num);
          return token;
        case '\"':
          return string();
        case '=':
          return op_eq('=');
        case '>':
          return op_eq('>');
        case '<':
          return op_eq('<');
        case '!':
          return op_eq('!');
        case '/':
          advance();
          if (c == '/') {
            skip_comment();
            break;
          } else {
            attr_buffer = "/";
            token.mutate(tk::DIV_WOQ, attr_buffer, line_num);
            return token;
          }
        case '\n':
          advance();
          ++line_num;
          break;
        case EOF:
          attr_buffer = "EOF";
          token.mutate(tk::END_FILE, attr_buffer, line_num);
          return token;
        default:
          error();
      }
    }
  }
  return token;
}

int Lexer::get_next_token_v2(tk::Token &token) {
  tk::Token result_token;
  while (1) {
    skip_whitespace();
    attr_buffer.clear();
    if (std::isdigit(c)) {
      result_token = number();
      break;
    } else if (std::isalnum(c)) {
      result_token = id_v2();
    } else {
      switch (c) {
        case '+':
          advance();
          attr_buffer = "+";
          result_token = tk::Token(tk::PLUS, attr_buffer, line_num);
          break;
        case '-':
          advance();
          attr_buffer = "-";
          result_token = tk::Token(tk::MINUS, attr_buffer, line_num);
          break;
        case '*':
          advance();
          attr_buffer = "*";
          result_token = tk::Token(tk::MULT, attr_buffer, line_num);
        case '%':
          advance();
          attr_buffer = "%";
          result_token = tk::Token(tk::MOD, attr_buffer, line_num);
        case '[':
          advance();
          attr_buffer = "]";
          result_token = tk::Token(tk::LSQBR, attr_buffer, line_num);
          break;
        case ']':
          advance();
          attr_buffer = "]";
          result_token = tk::Token(tk::RSQBR, attr_buffer, line_num);
          break;
        case '(':
          advance();
          attr_buffer = "(";
          result_token = tk::Token(tk::LPAREN, attr_buffer, line_num);
          break;
        case ')':
          advance();
          attr_buffer = ")";
          result_token = tk::Token(tk::RPAREN, attr_buffer, line_num);
          break;
        case '.':
          advance();
          attr_buffer = ".";
          result_token = tk::Token(tk::DOT, attr_buffer, line_num);
          break;
        case ',':
          advance();
          attr_buffer = ",";
          result_token = tk::Token(tk::COMMA, attr_buffer, line_num);
          break;
        case '\"':
          result_token = string();
          break;
        case '=':
          result_token = op_eq_v2('=');
          break;
        case '>':
          result_token = op_eq_v2('>');
          break;
        case '<':
          result_token = op_eq_v2('<');
          break;
        case '!':
          result_token = op_eq_v2('!');
          break;
        case '/':
          advance();
          if (c == '/') {
            skip_comment();
            break;
          } else {
            attr_buffer = "/";
            result_token = tk::Token(tk::DIV_WOQ, attr_buffer, line_num);
            break;
          }
        case '\n':
          advance();
          ++line_num;
          break;
        case EOF:
          attr_buffer = "EOF";
          result_token = tk::Token(tk::END_FILE, attr_buffer, line_num);
          break;
        default:
          error();
      }
    }
  }

  if (error_flag) {
    return 0;
  }
  token = result_token;
  return 1;
}

}  // namespace lxr
