#ifndef INTERPRETER_NEW_HPP
#define INTEPRETER_NEW_HPP

#include <string>

#include "AST.hpp"
#include "Parser.hpp"

class Interpreter {
 private:
  prs::Parser parser;

 public:
  Interpreter(std::string buffer);
};

#endif
