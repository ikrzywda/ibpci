#ifndef WASM_IBPCI
#define WASM_IBPCI

#include "Lexer.hpp"
#include "Parser.hpp"
#include "AST.hpp"
#include "ActivationRecord.hpp"
#include "Interpreter.hpp"
#include "ibpci.hpp"

#include <string>


const char *wasm_interpret(char *buffer, unsigned mode);
std::string wasm_throw_error(unsigned type, unsigned line_number, std::string message);

std::string wasm_run_lexer(std::string buffer);
std::string wasm_run_parser(std::string buffer);
std::string wasm_run_interpreter(std::string buffer, bool logging);

#endif
