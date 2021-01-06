#include "include/Parser.hpp"

namespace prs{
    
Parser::Parser(lxr::Lexer &&lexer) : lex(std::move(lexer)){	
    token = lex.get_next_token();
}

void Parser::eat(int token_id){
    if(token.id == token_id){
        token = lex.get_next_token();
    }else error(token_id);
}

void Parser::error(int token_id){
    std::cout << "SYNTAX ERROR at line " << lex.line_num << 
        ":unexpected token: " << tk::id_to_str(token.id);
    if(token_id >= 0)
        std::cout << ", expected token: " << tk::id_to_str(token_id);
    std::cout << std::endl;
    exit(1);
}

ast::AST *Parser::parse(){
    ast::AST *root = new ast::AST(ast::START);
    while(token.id != tk::END_FILE){
        root->push_child(stmt());
    }
    return root;
}

ast::AST *Parser::stmt(){
    switch(token.id){
        case tk::ID_VAR: return assign();
        case tk::ID_METHOD: return method_call();
        case tk::METHOD: return method();
        case tk::IF: return if_stmt();
        case tk::RETURN: return ret();
        case tk::LOOP:
            eat(tk::LOOP);
            if(token.id == tk::WHILE) return loop_whl();
            else if(token.id == tk::ID_VAR
                    || token.id == tk::ID_METHOD) return loop_for();
        case tk::INPUT: return in_out();
        case tk::OUTPUT: return in_out();
        default: error(-1);
    }
    return NULL;
}

ast::AST *Parser::method(){
    eat(tk::METHOD);
    ast::AST *params = NULL;
    ast::AST *root = new ast::AST(token, ast::METHOD, lex.line_num);
    eat(tk::ID_METHOD);
    eat(tk::LPAREN);
    if(token.id == tk::ID_VAR){
        params = new ast::AST(token, ast::PARAM, lex.line_num);
        params->push_child(factor());
        while(token.id != tk::RPAREN){
            eat(tk::COMMA);
            params->push_child(factor());
        }
    }
    eat(tk::RPAREN);
    if(params != NULL) root->push_child(params);
    while(token.id != tk::END){
        root->push_child(stmt());
    }
    eat(tk::END); eat(tk::METHOD);
    return root;
}   

ast::AST *Parser::ret(){
    ast::AST *root = new ast::AST(token, ast::RETURN, lex.line_num);
    eat(tk::RETURN);
    root->push_child(expr());
    return root;
}

ast::AST *Parser::loop_whl(){
    ast::AST *root = new ast::AST(token, ast::WHILE, lex.line_num);
    eat(tk::WHILE);
    root->push_child(cond());
    while(token.id != tk::END){
        root->push_child(stmt());
    }
    eat(tk::END); eat(tk::LOOP);
    return root;
}

ast::AST *Parser::loop_for(){
    ast::AST *root = new ast::AST(token, ast::FOR, lex.line_num);
    ast::AST *loop_range = factor();
    eat(tk::FROM);
    loop_range->push_child(expr());
    eat(tk::TO);
    loop_range->push_child(expr());
    root->push_child(loop_range);
    while(token.id != tk::END){
        root->push_child(stmt());
    }
    eat(tk::END); eat(tk::LOOP);
    return root;
}

ast::AST *Parser::if_stmt(){
    ast::AST *root = new ast::AST(token, ast::IF, lex.line_num);
    eat(tk::IF);
    root->push_child(cond());
    eat(tk::THEN);
    while(token.id != tk::END){
        if(token.id == tk::ELSE){
            root->push_child(else_stmt());
        }else{
            root->push_child(stmt());
        }
    }
    eat(tk::END);
    eat(tk::IF);
    return root;
}

ast::AST *Parser::else_stmt(){
    ast::AST *root = new ast::AST(token, ast::ELSE, lex.line_num);
    eat(tk::ELSE);
    if(token.id == tk::IF){
        root->push_child(elif_stmt());
        return root;
        std::cout << "returned elif";
    }else{
        while(token.id != tk::END){
            root->push_child(stmt());        
        }
    }
    return root;
}

ast::AST *Parser::elif_stmt(){
    eat(tk::IF);
    ast::AST *root = new ast::AST(token, ast::IF, lex.line_num);
    root->push_child(cond());
    eat(tk::THEN);
    while(token.id != tk::END){
        if(token.id == tk::ELSE){
            return root;
        }
        root->push_child(stmt());
    }
    return root;
}

ast::AST *Parser::cond(){
    ast::AST *root, *new_node;
    root = cmp();
    while(token.id == tk::AND
            || token.id == tk::OR){
        new_node = new ast::AST(token, ast::COND, lex.line_num);
        new_node->push_child(root);
        root = new_node;
        eat(token.id);
        new_node->push_child(cmp());
    }
    return root;
}

ast::AST *Parser::cmp(){
    ast::AST *root, *new_node;
    root = factor();
    if(token.id == tk::IS
            || token.id == tk::LT
            || token.id == tk::GT
            || token.id == tk::DNEQ
            || token.id == tk::GEQ
            || token.id == tk::LEQ){
        new_node = new ast::AST(token, ast::CMP, lex.line_num);  
        new_node->push_child(root);
        root = new_node;
        eat(token.id);
        new_node->push_child(expr());
    }
    return root;
}

ast::AST *Parser::assign(){
    ast::AST *root = new ast::AST(ast::ASSIGN);
    root->push_child(factor());
    eat(tk::EQ);
    root->push_child(expr());
    return root;
}

ast::AST *Parser::method_call(){
    ast::AST *root = new ast::AST(token, ast::METHOD_CALL, lex.line_num); 
    eat(tk::ID_METHOD);
    eat(tk::LPAREN);
    if(token.id != tk::RPAREN){
        root->push_child(expr());
        while(token.id != tk::RPAREN){
            eat(tk::COMMA);
            root->push_child(expr());
        }
    }
    eat(tk::RPAREN);
    return root;
}

ast::AST *Parser::expr(){
    ast::AST *root, *new_node;
    root = term();
    while(token.id == tk::PLUS 
            || token.id == tk::MINUS){
        new_node = new ast::AST(token, ast::BINOP, lex.line_num);
        new_node->push_child(root);
        root = new_node;
        eat(token.id);
        new_node->push_child(term());
    }
    return root;
}

ast::AST *Parser::term(){
    ast::AST *subroot, *new_node;
    subroot = factor();
    while(token.id == tk::MULT ||
            token.id == tk::DIV_WQ ||
            token.id == tk::DIV_WOQ ||
            token.id == tk::MOD){
        new_node = new ast::AST(token, ast::BINOP, lex.line_num);
        new_node->push_child(subroot);
        subroot = new_node;
        eat(token.id);
        new_node->push_child(factor());
    }
    return subroot;
}

ast::AST *Parser::factor(){
    ast::AST *new_node;
    switch(token.id){
        case tk::INT:
            new_node = new ast::AST(token, ast::INT, lex.line_num);
            eat(tk::INT);
            return new_node;
        case tk::FLOAT:
            new_node = new ast::AST(token, ast::FLOAT, lex.line_num);
            eat(tk::FLOAT);
            return new_node;
        case tk::MINUS:
            new_node = new ast::AST(token, ast::UN_MIN, lex.line_num);
            eat(tk::MINUS);
            if(token.id == tk::LPAREN){
            eat(tk::LPAREN);
            new_node->push_child(expr());
            eat(tk::RPAREN);
            }else new_node->push_child(factor());
            return new_node;
        case tk::STRING:
            new_node = new ast::AST(token, ast::STRING, lex.line_num);
            eat(tk::STRING);
            return new_node;
        case tk::ID_VAR:
            new_node = new ast::AST(token, ast::ID, lex.line_num);
            eat(tk::ID_VAR);
            while(token.id == tk::LSQBR){
                eat(tk::LSQBR);
                new_node->push_child(expr());
                eat(tk::RSQBR);
            }
            if(token.id == tk::DOT){ 
                new_node->push_child(std_method());
                return new_node;
            }
            if(!new_node->children.empty()) new_node->id = ast::ARR_ACC;
            return new_node;
        case tk::ID_METHOD:
            return method_call();
        case tk::LPAREN:
            eat(tk::LPAREN);
            new_node = expr();
            eat(tk::RPAREN);
            return new_node;
        case tk::LSQBR: return arr();
        case tk::NEW_ARR: return arr_dyn();
        case tk::NEW_STACK: 
            eat(tk::NEW_STACK); eat(tk::LPAREN); eat(tk::RPAREN);
            new_node = new ast::AST(token, ast::STACK, lex.line_num);
            return new_node;
        case tk::NEW_QUEUE:
            eat(tk::NEW_QUEUE); eat(tk::LPAREN); eat(tk::RPAREN);
            new_node = new ast::AST(token, ast::QUEUE, lex.line_num);
            return new_node;
        case tk::INPUT: return in_out();
        case tk::OUTPUT: return in_out();
        case tk::END_FILE: std::cout << "END";
        default: error(-1);
    }
    return 0; 
}

ast::AST *Parser::arr(){
    ast::AST *root = new ast::AST(token, ast::ARR, lex.line_num);
    eat(tk::LSQBR);
    if(token.id == tk::INT
            || token.id == tk::FLOAT
            || token.id == tk::STRING
            || token.id == tk::LSQBR){
        root->push_child(factor());
        while(token.id != tk::RSQBR){
            eat(tk::COMMA);
            root->push_child(factor());
        }
    }
    eat(tk::RSQBR);
    return root;
}

ast::AST *Parser::arr_dyn(){
    eat(tk::NEW_ARR);
    ast::AST *root = new ast::AST(token, ast::ARR_DYN, lex.line_num);
    eat(tk::LPAREN);
    root->push_child(expr());
    while(token.id != tk::RPAREN){
        eat(tk::COMMA);
        root->push_child(expr());
    }
    eat(tk::RPAREN);
    return root;
}

ast::AST *Parser::std_method(){
    eat(tk::DOT);
    ast::AST *root;
    if(token.id == tk::LENGTH
            || token.id == tk::ADD_ITEM
            || token.id == tk::GET_NEXT
            || token.id == tk::RESET_NEXT
            || token.id == tk::HAS_NEXT
            || token.id == tk::PUSH
            || token.id == tk::POP
            || token.id == tk::ENQUEUE
            || token.id == tk::DEQUEUE
            || token.id == tk::IS_EMPTY
            || token.id == tk::OUTPUT
            || token.id == tk::INPUT){
        root = new ast::AST(token, ast::STANDARD_METHOD, lex.line_num);
        eat(token.id);
        eat(tk::LPAREN);
        if(token.id != tk::RPAREN){
            root->push_child(expr());
            while(token.id != tk::RPAREN){
                eat(tk::COMMA);
                root->push_child(expr());
            }
        }
        eat(tk::RPAREN);
    }
    return root;
}

ast::AST *Parser::in_out(){
    ast::AST *root;
    if(token.id == tk::INPUT) root = new ast::AST(token, ast::INPUT, lex.line_num);
    else if(token.id == tk::OUTPUT) root = new ast::AST(token, ast::OUTPUT, lex.line_num);
    eat(token.id); eat(tk::LPAREN);
    root->push_child(expr());
    while(token.id != tk::RPAREN){
        eat(tk::COMMA);
        root->push_child(expr());
    }
    eat(tk::RPAREN);
    return root;
}

}
