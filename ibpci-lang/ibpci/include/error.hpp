#ifndef ERROR_HPP
#define ERROR_HPP

#include <string>

enum class ErrorType { LEXER, PARSER, SEMANTIC, RUNTIME, INTERNAL, UNKNOWN };

struct Error {
  std::string message;
  unsigned int line_num;
  ErrorType type;

  Error(std::string &&message, unsigned int line_num)
      : message(message), line_num(line_num) {}
  Error() = default;
};

#endif
