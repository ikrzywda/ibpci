#ifndef IBPCI_LEGACY_HPP
#define IBPCI_LEGACY_HPP

#include <activation_record.hpp>
#include <ast.hpp>
#include <fstream>
#include <iostream>
#include <lexer.hpp>
#include <parser.hpp>
#include <runtime.hpp>
#include <string>

void throw_error(unsigned type, unsigned line_number, std::string message);
void interpret(char *filename, unsigned mode);

std::string get_buffer(char *filename);
void run_lexer(std::string buffer);
void run_parser(std::string buffer);
void run_interpreter(std::string buffer, bool logging);

enum err_type { LEXICAL_ERROR, PARSE_ERROR, RUN_TIME_ERROR, FILE_NOT_FOUND };

enum run_mode { INTERPRET, PRINT_TOKENS, PRINT_AST, PRINT_CALL_STACK };

#endif
