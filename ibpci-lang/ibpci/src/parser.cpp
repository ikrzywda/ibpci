#include "../include/parser.hpp"

namespace prs {

Parser::Parser(std::string &&buffer) {
  lex = lxr::Lexer(std::move(buffer));
  if (!lex.get_next_token(token)) {
    error(-1);
  }
}

void Parser::eat(int token_id) {
  std::cout << "aaa Token: " << tk::id_to_str(token.id) << std::endl;
  if (token.id == token_id) {
    if (!lex.get_next_token(token)) {
      std::cout << "Explicitly throwing error from eat() in parser.cpp\n";
      Error err = lex.get_error();
      std::cout << "Error message: " << err.message << std::endl;
      error(-1);
    }

  } else
    error(token_id);
}

bool Parser::eat_v2(int token_id) {
  if (token.id == token_id) {
    if (!lex.get_next_token(token)) {
      std::cout << "Explicitly throwing error from eat() in parser.cpp\n";
      Error err = lex.get_error();
      std::cout << "Error message: " << err.message << std::endl;
      set_error(-1);
      return false;
    }
    return true;
  } else {
    set_error(token_id);
    return false;
  }
}

void Parser::set_error(int token_id) {
  error_flag = true;
  current_error.line_num = lex.line_num;
  current_error.message = "SYNTAX ERROR at line " + std::to_string(lex.line_num) + ":unexpected token: " + tk::id_to_str(token.id);
  if (token_id >= 0)
    current_error.message += ", expected token: " + tk::id_to_str(token_id);
}

Error Parser::get_error() {
  return current_error;
}

void Parser::error(int token_id) {
  std::cout << "SYNTAX ERROR at line " << lex.line_num
            << ":unexpected token: " << tk::id_to_str(token.id);
  if (token_id >= 0)
    std::cout << ", expected token: " << tk::id_to_str(token_id);
  std::cout << std::endl;
  exit(1);
}

ast::AST *Parser::parse() {
  ast::AST *root = new ast::AST(ast::START);
  while (token.id != tk::END_FILE) {
    root->push_child(stmt());
  }
  return root;
}

int Parser::parse_v2(ast::AST *root) {
  // TODO: add new error type for null root
  if (root == nullptr) {
    return 0;
  }
  ast::AST *stmt_root;
  root->id = ast::START;
  while (token.id != tk::END_FILE) {
    std::cout << "STMT" << std::endl;
    stmt_root = new ast::AST;
    if (!stmt_v2(stmt_root)) {
      delete stmt_root;
      ast::delete_tree(root);
      return 0;
    }
    root->push_child(stmt_root);
  }
  return 1;
}

ast::AST *Parser::stmt() {
  switch (token.id) {
    case tk::ID_VAR:
      return assign();
    case tk::ID_METHOD:
      return method_call();
    case tk::METHOD:
      return method();
    case tk::IF:
      return if_stmt();
    case tk::RETURN:
      return ret();
    case tk::LOOP:
      eat(tk::LOOP);
      if (token.id == tk::WHILE)
        return loop_whl();
      else if (token.id == tk::ID_VAR || token.id == tk::ID_METHOD)
        return loop_for();
    case tk::INPUT:
      return in_out();
    case tk::OUTPUT:
      return in_out();
    default:
      error(-1);
  }
  return NULL;
}

int Parser::stmt_v2(ast::AST *root) {
  if (root == nullptr) {
    std::cout << "Error: null root in stmt_v2()asdfsadffsda\n";
    return 0;
  }
  switch (token.id) {
    case tk::ID_VAR:
      return assign_v2(root);
    case tk::ID_METHOD:
    std::cout << "Method call in stmt_v2()\n";
      return method_call_v2(root);
    case tk::METHOD:
      std::cout << "Method call in stmt_v2()\n";
      return method_v2(root);
    case tk::IF:
      return if_stmt_v2(root);
    case tk::RETURN:
      return ret_v2(root);
    case tk::LOOP:
      eat(tk::LOOP);
      if (token.id == tk::WHILE)
        return loop_whl_v2(root);
      else if (token.id == tk::ID_VAR || token.id == tk::ID_METHOD)
        return loop_for_v2(root);
    case tk::INPUT:
      return in_out_v2(root);
    case tk::OUTPUT:
      std::cout << "Output in stmt_v2()\n";
      return in_out_v2(root);
    default:
      set_error(-1);
  }
  return 0;
}

ast::AST *Parser::block() {
  ast::AST *root = new ast::AST(ast::BLOCK);
  while (token.id != tk::END) {
    root->push_child(stmt());
  }
  eat(tk::END);
  return root;
}

int Parser::block_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  ast::AST *stmt_root;
  while (token.id != tk::END) {
    stmt_root = new ast::AST;
    if (!stmt_v2(stmt_root)) {
      delete stmt_root;
      return 0;
    }
    root->push_child(stmt_root);
  }
  return eat_v2(tk::END);
}

ast::AST *Parser::if_block() {
  ast::AST *root = new ast::AST(ast::BLOCK);
  while (token.id != tk::END) {
    if (token.id == tk::ELSE) {
      return root;
    } else {
      root->push_child(stmt());
    }
  }
  return root;
}

int Parser::if_block_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  ast::AST *stmt_root;
  while (token.id != tk::END) {
    if (token.id == tk::ELSE) {
      return 1;
    } else {
      stmt_root = new ast::AST;
      if (!stmt_v2(stmt_root)) {
        delete stmt_root;
        return 0;
      }
      root->push_child(stmt_root);
    }
  }
  return 1;
}

ast::AST *Parser::method() {
  eat(tk::METHOD);
  ast::AST *params = nullptr;
  ast::AST *root = new ast::AST(token, ast::METHOD);
  eat(tk::ID_METHOD);
  eat(tk::LPAREN);
  if (token.id == tk::ID_VAR) {
    params = new ast::AST(ast::PARAM);
    params->push_child(factor());
    while (token.id != tk::RPAREN) {
      eat(tk::COMMA);
      params->push_child(factor());
    }
  }
  eat(tk::RPAREN);
  if (params != nullptr) root->push_child(params);
  root->push_child(block());
  eat(tk::METHOD);
  return root;
}

int Parser::method_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::METHOD)) {
    return 0;
  }
  root->id = ast::METHOD;
  ast::AST *params_root = nullptr;
  ast::AST *factor_root = nullptr;
  ast::AST *block_root = nullptr;
  if (!eat_v2(tk::ID_METHOD) || !eat_v2(tk::LPAREN)) {
    return 0;
  }
  if (token.id == tk::ID_VAR) {
    params_root = new ast::AST(ast::PARAM);
    factor_root = new ast::AST;
    if (!factor_v2(factor_root)) {
      delete params_root;
      delete factor_root;
      return 0;
    }
    params_root->push_child(factor_root);
    while (token.id != tk::RPAREN) {
      if (!eat_v2(tk::COMMA)) {
        return 0;
      }
      factor_root = new ast::AST;
      if (!factor_v2(factor_root)) {
        delete params_root;
        delete factor_root;
        return 0;
      }
      params_root->push_child(factor_root);
    }
  }
  if (!eat_v2(tk::RPAREN)) {
    return 0;
  }
  if (params_root != nullptr) {
    root->push_child(params_root);
  }
  block_root = new ast::AST;
  if (!block_v2(block_root)) {
    delete block_root;
    return 0;
  }
  root->push_child(block_root);

  return eat_v2(tk::METHOD);
}

ast::AST *Parser::ret() {
  ast::AST *root = new ast::AST(token, ast::RETURN);
  eat(tk::RETURN);
  root->push_child(expr());
  return root;
}

int Parser::ret_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::RETURN)) {
    return 0;
  }
  root->id = ast::RETURN;
  ast::AST *expr_root = new ast::AST;
  if (!expr_v2(expr_root)) {
    delete expr_root;
    return 0;
  }
  root->push_child(expr_root);
  return 1;
}

ast::AST *Parser::loop_whl() {
  ast::AST *root = new ast::AST(ast::WHILE);
  eat(tk::WHILE);
  root->push_child(cond());
  root->push_child(block());
  eat(tk::LOOP);
  return root;
}

int Parser::loop_whl_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::WHILE)) {
    return 0;
  }
  root->id = ast::WHILE;
  ast::AST *cond_root = new ast::AST;
  ast::AST *block_root = new ast::AST;
  if (!cond_v2(cond_root) || !block_v2(block_root)) {
    delete cond_root;
    delete block_root;
    return 0;
  }
  root->push_child(cond_root);
  root->push_child(block_root);
  return eat_v2(tk::LOOP);
}

ast::AST *Parser::loop_for() {
  ast::AST *root = new ast::AST(ast::FOR);
  ast::AST *loop_range = new ast::AST(ast::RANGE);
  loop_range->push_child(factor());
  eat(tk::FROM);
  loop_range->push_child(expr());
  eat(tk::TO);
  loop_range->push_child(expr());
  root->push_child(loop_range);
  root->push_child(block());
  eat(tk::LOOP);
  return root;
}

int Parser::loop_for_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  root->id = ast::FOR;
  ast::AST *loop_range_root = new ast::AST(ast::RANGE);
  ast::AST *factor_root = new ast::AST;
  ast::AST *expr_root = new ast::AST;
  if (!factor_v2(factor_root) || !eat_v2(tk::FROM) || !expr_v2(expr_root) ||
      !eat_v2(tk::TO) || !expr_v2(expr_root)) {
    delete loop_range_root;
    delete factor_root;
    delete expr_root;
    return 0;
  }
  loop_range_root->push_child(factor_root);
  loop_range_root->push_child(expr_root);
  loop_range_root->push_child(expr_root);
  root->push_child(loop_range_root);
  ast::AST *block_root = new ast::AST;
  if (!block_v2(block_root)) {
    delete block_root;
    return 0;
  }
  root->push_child(block_root);
  return eat_v2(tk::LOOP);
}

ast::AST *Parser::if_stmt() {
  ast::AST *root = new ast::AST(token, ast::IF);
  eat(tk::IF);
  root->push_child(cond());
  eat(tk::THEN);
  root->push_child(if_block());
  while (token.id == tk::ELSE) {
    root->push_child(else_stmt());
  }
  eat(tk::END);
  eat(tk::IF);
  return root;
}

int Parser::if_stmt_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::IF)) {
    return 0;
  }
  root->id = ast::IF;
  ast::AST *cond_root = new ast::AST;
  ast::AST *if_block_root = new ast::AST;
  if (!cond_v2(cond_root) || !eat_v2(tk::THEN) || !if_block_v2(if_block_root)) {
    delete cond_root;
    delete if_block_root;
    return 0;
  }
  root->push_child(cond_root);
  root->push_child(if_block_root);
  while (token.id == tk::ELSE) {
    ast::AST *else_stmt_root = new ast::AST;
    if (!else_stmt_v2(else_stmt_root)) {
      delete else_stmt_root;
      return 0;
    }
    root->push_child(else_stmt_root);
  }
  return eat_v2(tk::END) && eat_v2(tk::IF);
}

ast::AST *Parser::else_stmt() {
  ast::AST *root;
  eat(tk::ELSE);
  if (token.id == tk::IF) {
    root = elif_stmt();
    return root;
  } else {
    root = new ast::AST(ast::ELSE);
    root->push_child(if_block());
  }
  return root;
}

int Parser::else_stmt_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::ELSE)) {
    return 0;
  }
  if (token.id == tk::IF) {
    root->id = ast::ELIF;
    ast::AST *cond_root = new ast::AST;
    ast::AST *if_block_root = new ast::AST;
    if (!elif_stmt_v2(cond_root) || !if_block_v2(if_block_root)) {
      delete cond_root;
      delete if_block_root;
      return 0;
    }
    root->push_child(cond_root);
    root->push_child(if_block_root);
  } else {
    root->id = ast::ELSE;
    ast::AST *if_block_root = new ast::AST;
    if (!if_block_v2(if_block_root)) {
      delete if_block_root;
      return 0;
    }
    root->push_child(if_block_root);
  }
  return 1;
}


ast::AST *Parser::elif_stmt() {
  eat(tk::IF);
  ast::AST *root = new ast::AST(ast::ELIF);
  root->push_child(cond());
  eat(tk::THEN);
  root->push_child(if_block());
  return root;
}

int Parser::elif_stmt_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  if (!eat_v2(tk::IF)) {
    return 0;
  }
  root->id = ast::ELIF;
  ast::AST *cond_root = new ast::AST;
  ast::AST *if_block_root = new ast::AST;
  if (!cond_v2(cond_root) || !eat_v2(tk::THEN) || !if_block_v2(if_block_root)) {
    delete cond_root;
    delete if_block_root;
    return 0;
  }
  root->push_child(cond_root);
  root->push_child(if_block_root);
  return 1;
}

ast::AST *Parser::cond() {
  ast::AST *root, *new_node;
  root = cmp();
  while (token.id == tk::AND || token.id == tk::OR) {
    new_node = new ast::AST(token, ast::COND);
    new_node->push_child(root);
    root = new_node;
    eat(token.id);
    new_node->push_child(cmp());
  }
  return root;
}

int Parser::cond_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  root->id = ast::COND;
  ast::AST *cmp_root = new ast::AST;
  if (!cmp_v2(cmp_root)) {
    delete cmp_root;
    return 0;
  }
  root->push_child(cmp_root);
  while (token.id == tk::AND || token.id == tk::OR) {
    ast::AST *new_node = new ast::AST(token, ast::COND);
    new_node->push_child(root);
    root = new_node;
    eat(token.id);
    ast::AST *cmp_root = new ast::AST;
    if (!cmp_v2(cmp_root)) {
      delete cmp_root;
      return 0;
    }
    root->push_child(cmp_root);
  }
  return 1;
}

ast::AST *Parser::cmp() {
  ast::AST *root, *new_node;
  root = factor();
  if (token.id == tk::IS || token.id == tk::LT || token.id == tk::GT ||
      token.id == tk::DNEQ || token.id == tk::GEQ || token.id == tk::LEQ) {
    new_node = new ast::AST(token, ast::CMP);
    new_node->push_child(root);
    root = new_node;
    eat(token.id);
    new_node->push_child(expr());
  }
  return root;
}

int Parser::cmp_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  root->id = ast::CMP;
  ast::AST *expression_root = nullptr;
  ast::AST *factor_root = new ast::AST;

  if (!factor_v2(factor_root)) {
    delete factor_root;
    return 0;
  }
  root->push_child(factor_root);
  if (token.id == tk::IS || token.id == tk::LT || token.id == tk::GT ||
      token.id == tk::DNEQ || token.id == tk::GEQ || token.id == tk::LEQ) {
        root->push_child(factor_root);
        if (!eat_v2(token.id)) {
          return 0;
        }
        ast::AST *expression_root = new ast::AST;
        if (!expr_v2(expression_root)) {
          delete expression_root;
          return 0;
        }
        root->push_child(expression_root);
    }
  return 1;
}


ast::AST *Parser::assign() {
  ast::AST *root = new ast::AST(ast::ASSIGN);
  root->push_child(factor());
  if (root->children[0]->id == ast::STD_VOID) {
    root->id = ast::STD_VOID;
    return root;
  } else {
    eat(tk::EQ);
    root->push_child(expr());
  }
  return root;
}

int Parser::assign_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  root->id = ast::ASSIGN;
  ast::AST *expression_root = nullptr;
  ast::AST *factor_root = new ast::AST;
  if (!factor_v2(factor_root)) {
    delete factor_root;
    return 0;
  }
  root->push_child(factor_root);
  if (root->children[0]->id == ast::STD_VOID) {
    root->id = ast::STD_VOID;
    return 1;
  } else {
    expression_root = new ast::AST;
    if (!eat_v2(tk::EQ) || !expr_v2(expression_root)) {
      delete expression_root;
      return 0;
    }
    root->push_child(expression_root);
  }
  return 1;
}

ast::AST *Parser::method_call() {
  ast::AST *root = new ast::AST(token, ast::METHOD_CALL);
  ast::AST *params = nullptr;
  eat(tk::ID_METHOD);
  eat(tk::LPAREN);
  if (token.id != tk::RPAREN) {
    params = new ast::AST(ast::PARAM);
    params->push_child(expr());
    while (token.id != tk::RPAREN) {
      eat(tk::COMMA);
      params->push_child(expr());
    }
  }
  eat(tk::RPAREN);
  if (params != nullptr) root->push_child(params);
  return root;
}

int Parser::method_call_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  root->id = ast::METHOD_CALL;
  ast::AST *params = nullptr;
  ast::AST *expression_root = nullptr;
  if (!eat_v2(tk::ID_METHOD) || !eat_v2(tk::LPAREN)) {
    return 0;
  }
  if (token.id != tk::RPAREN) {
    params = new ast::AST(ast::PARAM);
    expression_root = new ast::AST;
    if (!expr_v2(expression_root)) {
      delete params;
      delete expression_root;
      return 0;
    }
    params->push_child(expression_root);
    while (token.id != tk::RPAREN) {
      if (!eat_v2(tk::COMMA)) {
        return 0;
      }
      expression_root = new ast::AST;
      if (!expr_v2(expression_root)) {
        ast::delete_tree(params);
        delete expression_root;
        return 0;
      }
      params->push_child(expression_root);
    }
  }
  if (!eat_v2(tk::RPAREN)) {
    ast::delete_tree(params);
    return 0;
  }
  if (params != nullptr) {
    root->push_child(params);
  }
  return 1;
}

ast::AST *Parser::expr() {
  ast::AST *root, *new_node;
  root = term();
  while (token.id == tk::PLUS || token.id == tk::MINUS) {
    new_node = new ast::AST(token, ast::BINOP);
    new_node->push_child(root);
    root = new_node;
    eat(token.id);
    new_node->push_child(term());
  }
  return root;
}

int Parser::expr_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  ast::AST *term_root = new ast::AST;
  ast::AST *expression_root = nullptr;
  if (!term_v2(root)) {
    std::cout << "term_v2 failed first" << std::endl;
    delete term_root;
    return 0;
  }
  while (token.id == tk::PLUS || token.id == tk::MINUS) {
    expression_root = new ast::AST(token, ast::BINOP);
    expression_root->push_child(root);
    root = expression_root;
    if (!eat_v2(token.id)) {
      delete expression_root;
      return 0;
    }
    term_root = new ast::AST;
    if (!term_v2(term_root)) {
      std::cout << "term_v2 failed" << std::endl;
      delete term_root;
      return 0;
    }
    expression_root->push_child(term_root);
  }
  return 1;
}

ast::AST *Parser::term() {
  ast::AST *subroot, *new_node;
  subroot = factor();
  while (token.id == tk::MULT || token.id == tk::DIV_WQ ||
         token.id == tk::DIV_WOQ || token.id == tk::MOD) {
    new_node = new ast::AST(token, ast::BINOP);
    new_node->push_child(subroot);
    subroot = new_node;
    eat(token.id);
    new_node->push_child(factor());
  }
  return subroot;
}

int Parser::term_v2(ast::AST *root) {
  if (root == nullptr) {
    std::cout << "passin null root" << std::endl; // TODO: remove this
    return 0;
  }
  root->id = ast::BINOP;
  ast::AST *factor_root = new ast::AST;
  ast::AST *expression_root = nullptr;
  if (!factor_v2(factor_root)) {
    std::cout << "factor failed first" << std::endl;
    delete factor_root;
    return 0;
  }
  root->push_child(factor_root);
  while (token.id == tk::MULT || token.id == tk::DIV_WQ ||
         token.id == tk::DIV_WOQ || token.id == tk::MOD) {
    expression_root = new ast::AST(token, ast::BINOP);
    expression_root->push_child(root);
    root = expression_root;
    if (!eat_v2(token.id)) {
      delete expression_root;
      return 0;
    }
    factor_root = new ast::AST;
    if (!factor_v2(factor_root)) {
      std::cout << "factor failed" << std::endl;
      delete factor_root;
      return 0;
    }
    root->push_child(factor_root);
  }
  return 1;
}

ast::AST *Parser::factor() {
  ast::AST *new_node;
  switch (token.id) {
    case tk::NUM:
      new_node = new ast::AST(token, ast::NUM);
      eat(tk::NUM);
      return new_node;
    case tk::MINUS:
      new_node = new ast::AST(token, ast::UN_MIN);
      eat(tk::MINUS);
      if (token.id == tk::LPAREN) {
        eat(tk::LPAREN);
        new_node->push_child(expr());
        eat(tk::RPAREN);
      } else
        new_node->push_child(factor());
      return new_node;
    case tk::STRING:
      new_node = new ast::AST(token, ast::STRING);
      eat(tk::STRING);
      return new_node;
    case tk::ID_VAR:
      new_node = new ast::AST(token, ast::ID);
      eat(tk::ID_VAR);
      if (token.id == tk::LSQBR) {
        while (token.id == tk::LSQBR) {
          eat(tk::LSQBR);
          new_node->push_child(expr());
          eat(tk::RSQBR);
        }
        if (!new_node->children.empty()) new_node->id = ast::ARR_ACC;
      }
      if (token.id == tk::DOT) {
        new_node->push_child(std_method());
        new_node->id = new_node->children[0]->id;
        return new_node;
      }
      return new_node;
    case tk::ID_METHOD:
      return method_call();
    case tk::LPAREN:
      eat(tk::LPAREN);
      new_node = expr();
      eat(tk::RPAREN);
      return new_node;
    case tk::LSQBR:
      return arr();
    case tk::NEW_ARR:
      return arr_dyn();
    case tk::NEW_STACK:
      eat(tk::NEW_STACK);
      eat(tk::LPAREN);
      eat(tk::RPAREN);
      new_node = new ast::AST(token, ast::STACK);
      return new_node;
    case tk::NEW_QUEUE:
      eat(tk::NEW_QUEUE);
      eat(tk::LPAREN);
      eat(tk::RPAREN);
      new_node = new ast::AST(token, ast::QUEUE);
      return new_node;
    case tk::INPUT:
      return in_out();
    case tk::OUTPUT:
      return in_out();
    case tk::END_FILE:
      std::cout << "END";
    default:
      error(-1);
  }
  return 0;
}

int Parser::factor_v2(ast::AST *root) {
  if (root == nullptr) {
    return 0;
  }
  switch(token.id) {
    case tk::NUM: {
      *root = ast::AST(token, ast::NUM);
      return eat_v2(tk::NUM);
    }
    case tk::MINUS: {
      *root = ast::AST(token, ast::UN_MIN);
      if (!eat_v2(tk::MINUS)) {
        return 0;
      }
      if (token.id == tk::LPAREN) {
        ast::AST *expression_root = new ast::AST;
        bool result = eat_v2(tk::LPAREN) && expr_v2(expression_root) && eat_v2(tk::RPAREN);
        if (!result) {
          delete expression_root;
          return 0;
        }
        root->push_child(expression_root);
      } else {
        ast::AST *factor_root = new ast::AST;
        if (!factor_v2(factor_root)) {
          delete factor_root;
          return 0;
        }
        root->push_child(factor_root);
      }
      return 1;
    }
    case tk::STRING: {
      *root = ast::AST(token, ast::STRING);
      return eat_v2(tk::STRING);
    }
    case tk::ID_VAR: {
      *root = ast::AST(token, ast::ID);
      if (!eat_v2(tk::ID_VAR)) {
        return 0;
      }
      if (token.id == tk::LSQBR) {
        ast::AST *expression_root = nullptr;
        while (token.id == tk::LSQBR) {
          expression_root = new ast::AST;
          if (!eat_v2(tk::LSQBR) || !expr_v2(expression_root) || !eat_v2(tk::RSQBR)) {
            delete expression_root;
            return 0;
          }
          root->push_child(expression_root);
        }
        if (!root->children.empty()) {
          root->id = ast::ARR_ACC;
        }
      }
      if (token.id == tk::DOT) {
        ast::AST *std_method_root = new ast::AST;
        if (!std_method_v2(std_method_root)) {
          delete std_method_root;
          return 0;
        }
        root->push_child(std_method_root);
        root->id = root->children[0]->id;
        return 1;
      }
      return 1;
    }
    case tk::ID_METHOD: {
      return method_call_v2(root);
    }
    case tk::LPAREN: {
      return eat_v2(tk::LPAREN) && expr_v2(root) && eat_v2(tk::RPAREN);
    }
    case tk::LSQBR: {
      return arr_v2(root);
    }
    case tk::NEW_ARR: {
      return arr_dyn_v2(root);
    }
    case tk::NEW_STACK: {
      if (!eat_v2(tk::NEW_STACK) || !eat_v2(tk::LPAREN) || !eat_v2(tk::RPAREN)) {
        return 0;
      }
      *root = ast::AST(token, ast::STACK);
      return 1;
    }
    case tk::NEW_QUEUE: {
      if (!eat_v2(tk::NEW_QUEUE) || !eat_v2(tk::LPAREN) || !eat_v2(tk::RPAREN)) {
        return 0;
      }
      *root = ast::AST(token, ast::QUEUE);
      return 1;
    }
    case tk::INPUT:
      return in_out_v2(root);
    case tk::OUTPUT:
      return in_out_v2(root);
    case tk::END_FILE:
      std::cout << "END";
      return 1;
    default:
      set_error(-1);
      return 0;
  }
  return 1;
  }

ast::AST *Parser::arr() {
  ast::AST *root = new ast::AST(token, ast::ARR);
  eat(tk::LSQBR);
  if (token.id == tk::NUM || token.id == tk::STRING || token.id == tk::LSQBR) {
    root->push_child(factor());
    while (token.id != tk::RSQBR) {
      eat(tk::COMMA);
      root->push_child(factor());
    }
  }
  eat(tk::RSQBR);
  return root;
}

int Parser::arr_v2(ast::AST *root) {
  if (root == nullptr || !eat_v2(tk::LSQBR)) {
    return 0;
  }
  ast::AST *factor_root = nullptr;
  *root = ast::AST(token, ast::ARR);
  if (token.id == tk::NUM || token.id == tk::STRING || token.id == tk::LSQBR) {
    factor_root = new ast::AST;
    if (!factor_v2(factor_root)) {
      delete factor_root;
      return 0;
    }
    root->push_child(factor_root);
    while (token.id != tk::RSQBR) {
      if (!eat_v2(tk::COMMA)) {
        return 0;
      }
      factor_root = new ast::AST;
      if (!factor_v2(factor_root)) {
        delete factor_root;
        return 0;
      }
      root->push_child(factor_root);
    }
  }
  return eat_v2(tk::RSQBR);
}

ast::AST *Parser::arr_dyn() {
  eat(tk::NEW_ARR);
  ast::AST *root = new ast::AST(token, ast::ARR_DYN);
  eat(tk::LPAREN);
  root->push_child(expr());
  while (token.id != tk::RPAREN) {
    eat(tk::COMMA);
    root->push_child(expr());
  }
  eat(tk::RPAREN);
  return root;
}

int Parser::arr_dyn_v2(ast::AST *root) {
  if (root == nullptr || !eat_v2(tk::NEW_ARR) || !eat_v2(tk::LPAREN)) {
    return 0;
  }
  ast::AST *expression_root = nullptr;
  *root = ast::AST(token, ast::ARR_DYN);
  if (!expr_v2(root)) {
    return 0;
  }
  while (token.id != tk::RPAREN) {
    if (!eat_v2(tk::COMMA)) {
      return 0;
    }
    expression_root = new ast::AST;
    if (!expr_v2(expression_root)) {
      delete expression_root;
      return 0;
    }
    root->push_child(expression_root);
  }
  return eat_v2(tk::RPAREN);
}

ast::AST *Parser::std_method() {
  eat(tk::DOT);
  ast::AST *root;
  if (token.id == tk::LENGTH || token.id == tk::GET_NEXT ||
      token.id == tk::HAS_NEXT || token.id == tk::POP ||
      token.id == tk::DEQUEUE || token.id == tk::IS_EMPTY ||
      token.id == tk::INPUT) {
    root = new ast::AST(token, ast::STD_RETURN);
    eat(token.id);
  } else if (token.id == tk::GET_NEXT || token.id == tk::PUSH ||
             token.id == tk::ENQUEUE) {
    root = new ast::AST(token, ast::STD_VOID);
    eat(token.id);
  }
  eat(tk::LPAREN);
  if (token.id != tk::RPAREN) {
    root->push_child(expr());
    while (token.id != tk::RPAREN) {
      eat(tk::COMMA);
      root->push_child(expr());
    }
  }
  eat(tk::RPAREN);
  return root;
}

int Parser::std_method_v2(ast::AST *root) {
  if (root == nullptr || !eat_v2(tk::DOT)) {
    return 0;
  }
  ast::AST *expression_root = nullptr;
    if (token.id == tk::LENGTH || token.id == tk::GET_NEXT ||
      token.id == tk::HAS_NEXT || token.id == tk::POP ||
      token.id == tk::DEQUEUE || token.id == tk::IS_EMPTY ||
      token.id == tk::INPUT) {
    *root = ast::AST(token, ast::STD_RETURN);
    if (!eat_v2(token.id)) {
      return 0;
    }
    } else if (token.id == tk::GET_NEXT || token.id == tk::PUSH ||
             token.id == tk::ENQUEUE) {
    *root = ast::AST(token, ast::STD_VOID);
    if (!eat_v2(token.id)) {
      return 0;
    }
             }
  if (!eat_v2(tk::LPAREN)) {
    return 0;
  }
  if (token.id != tk::RPAREN) {
    expression_root = new ast::AST;
    if (!expr_v2(expression_root)) {
      delete expression_root;
      return 0;
    }
    root->push_child(expression_root);
    while (token.id != tk::RPAREN) {
      if (!eat_v2(tk::COMMA)) {
        return 0;
      }
      expression_root = new ast::AST;
      if (!expr_v2(expression_root)) {
        delete expression_root;
        return 0;
      }
      root->push_child(expression_root);
    }
  }
  return eat_v2(tk::RPAREN);
}

ast::AST *Parser::in_out() {
  ast::AST *root;
  if (token.id == tk::INPUT)
    root = new ast::AST(token, ast::INPUT);
  else if (token.id == tk::OUTPUT)
    root = new ast::AST(token, ast::OUTPUT);
  eat(token.id);
  eat(tk::LPAREN);
  root->push_child(expr());
  while (token.id != tk::RPAREN) {
    eat(tk::COMMA);
    root->push_child(expr());
  }
  eat(tk::RPAREN);
  return root;
}

int Parser::in_out_v2(ast::AST *root) {
  if (root == nullptr) {
    std::cout << "root is null" << std::endl;
    return 0;
  }
  if (token.id == tk::INPUT) {
    *root = ast::AST(token, ast::INPUT);
  } else if (token.id == tk::OUTPUT){
    *root = ast::AST(token, ast::OUTPUT);
  }
  if (!eat_v2(token.id) || !eat_v2(tk::LPAREN)) {
    return 0;
  }
  ast::AST *expression_root = new ast::AST;
  if (!expr_v2(expression_root)) {
    std::cout << "expr_v2 failed first one" << std::endl;
    delete expression_root;
    return 0;
  }
  root->push_child(expression_root);
  while (token.id != tk::RPAREN) {
    if (!eat_v2(tk::COMMA)) {
      return 0;
    }
    expression_root = new ast::AST;
    if (!expr_v2(expression_root)) {
      std::cout << "expr_v2 failed" << std::endl;
      delete expression_root;
      return 0;
    }
    root->push_child(expression_root);
  }
  return eat_v2(tk::RPAREN);
}

}  // namespace prs
