#ifndef TEST_HPP
#define TEST_HPP

#include "Lexer.hpp"
#include "Parser.hpp"
#include "AST.hpp"
#include "Symtab.hpp"
#include "ibpcc.hpp"
#include <fstream>
#include <iostream>

namespace test{

std::string *get_buffer(char *filename);

void compile(char *filename);

void test_lexer(char *filename);

void test_parser(char *filename);

void tree(char *filename);

}

#endif
