#ifndef INTERPRETER_NEW_HPP
#define INTEPRETER_NEW_HPP

#include "Parser.hpp"
#include "AST.hpp"

#include <string>

class Interpreter
{
private:
    prs::Parser parser;
public:
    Interpreter(std::string buffer);
};

#endif
