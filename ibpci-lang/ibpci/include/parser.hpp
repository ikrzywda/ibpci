#ifndef PARSER_HPP
#define PARSER_HPP

#include <iostream>
#include <string>

#include "ast.hpp"
#include "error.hpp"
#include "lexer.hpp"
#include "token.hpp"

namespace prs {

class Parser {
 private:
  lxr::Lexer lex;
  tk::Token token;

  void eat(int token_id);
  bool eat_v2(int token_id);
  void error(int token_id);
  void set_error(int token_id);
  bool error_flag{false};
  Error current_error;

  ast::AST *stmt();
  ast::AST *block();
  ast::AST *if_block();
  ast::AST *method();
  ast::AST *ret();
  ast::AST *loop_whl();
  ast::AST *loop_for();
  ast::AST *if_stmt();
  ast::AST *else_stmt();
  ast::AST *elif_stmt();
  ast::AST *cond();
  ast::AST *cmp();
  ast::AST *assign();
  ast::AST *method_call();
  ast::AST *expr();
  ast::AST *term();
  ast::AST *factor();
  ast::AST *arr();
  ast::AST *arr_dyn();
  ast::AST *std_method();
  ast::AST *in_out();

  int stmt_v2(ast::AST *root);
  int block_v2(ast::AST *root);
  int if_block_v2(ast::AST *root);
  int method_v2(ast::AST *root);
  int ret_v2(ast::AST *root);
  int loop_whl_v2(ast::AST *root);
  int loop_for_v2(ast::AST *root);
  int if_stmt_v2(ast::AST *root);
  int else_stmt_v2(ast::AST *root);
  int elif_stmt_v2(ast::AST *root);
  int cond_v2(ast::AST *root);
  int cmp_v2(ast::AST *root);
  int assign_v2(ast::AST *root);
  int method_call_v2(ast::AST *root);
  int expr_v2(ast::AST *root);
  int term_v2(ast::AST *root);
  int factor_v2(ast::AST *root);
  int arr_v2(ast::AST *root);
  int arr_dyn_v2(ast::AST *root);
  int std_method_v2(ast::AST *root);
  int in_out_v2(ast::AST *root);

 public:
  Parser(std::string &&buffer);
  Error get_error();
  ast::AST *parse();
};

}  // namespace prs

#endif
