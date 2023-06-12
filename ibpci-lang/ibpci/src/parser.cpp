#include "../include/parser.hpp"

namespace prs {

Parser::Parser(std::string &&buffer) {
  lex = lxr::Lexer(std::move(buffer));
  if (!lex.get_next_token(token)) {
    error(-1);
  }
  std::cout << "Token: " << tk::id_to_str(token.id) << std::endl;
}

void Parser::eat(int token_id) {
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
    return 0;
  }
  ast::AST *root = new ast::AST;
  switch (token.id) {
    case tk::ID_VAR:
      return assign_v2(root);
    case tk::ID_METHOD:
      return method_call_v2(root);
    case tk::METHOD:
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

ast::AST *Parser::ret() {
  ast::AST *root = new ast::AST(token, ast::RETURN);
  eat(tk::RETURN);
  root->push_child(expr());
  return root;
}

ast::AST *Parser::loop_whl() {
  ast::AST *root = new ast::AST(ast::WHILE);
  eat(tk::WHILE);
  root->push_child(cond());
  root->push_child(block());
  eat(tk::LOOP);
  return root;
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

ast::AST *Parser::elif_stmt() {
  eat(tk::IF);
  ast::AST *root = new ast::AST(ast::ELIF);
  root->push_child(cond());
  eat(tk::THEN);
  root->push_child(if_block());
  return root;
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

}  // namespace prs
