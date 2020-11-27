#ifndef IBPCC_HPP
#define IBPCC_HPP

#include "Lexer.hpp"
#include "Parser.hpp"
#include <fstream>
#include <iostream>

namespace ibpcc{

std::string *get_buffer(char *filename);

void compile(char *filename);

void test_lexer(char *filename);

void test_parser(char *filename);

}

#endif
