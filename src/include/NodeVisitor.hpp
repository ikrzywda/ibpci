#ifndef NODE_VISITOR_HPP
#define NODE_VISITOR_HPP

#include "AST.hpp"
#include "Token.hpp"
#include <iostream>
#include <string>

namespace nv{

float visit_expr(ast::AST *root);

}

#endif
