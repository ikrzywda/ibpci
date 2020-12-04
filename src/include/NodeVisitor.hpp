#ifndef NODE_VISITOR_HPP
#define NODE_VISITOR_HPP

#include "AST.hpp"
#include "Token.hpp"
#include <iostream>
#include <string>

namespace nv{

void print_ast(ast::AST *root);

const char *tok_to_str(tk::Token *token);

}

#endif
