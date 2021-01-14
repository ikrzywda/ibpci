#ifndef IBPCI_HPP
#define IBPCI_HPP

#include "Lexer.hpp"
#include "Parser.hpp"
#include "AST.hpp"
#include "ActivationRecord.hpp"
#include "Interpreter.hpp"
#include <fstream>
#include <iostream>


std::string get_buffer(char *filename);
void run_lexer(char *filename);
void run_parser(char *filename);
void run_interpreter(char *filename, bool logging);

#endif
