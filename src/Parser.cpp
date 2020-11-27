#include "include/Parser.hpp"

namespace prs{
    
Parser::Parser(const lxr::Lexer &lexer) : lex(lexer){
    current_token = lex.get_next_token();
}

void Parser::eat(int token_id){
    if(current_token->id == token_id){
        current_token = lex.get_next_token();
        }else{
        std::cout << "unexpected token: " << 
            *tk::id_to_str(current_token->id) <<
            ", expected token: " << *tk::id_to_str(token_id) <<
            std::endl;
            exit(1);
    }   
}

void Parser::parse(){
    while(current_token->id != tk::END_FILE){
        switch(current_token->id){
            case tk::METHOD: method(); break;
        }   
    }
    eat(tk::END_FILE);
}

ast::AST *Parser::method(){
    eat(tk::METHOD);
    eat(tk::ID_METHOD);
    eat(tk::LPAREN);
    if(current_token->id == tk::ID_VAR){
        eat(tk::ID_VAR);
        while(current_token->id != tk::RPAREN){
            eat(tk::COMMA);
            eat(tk::ID_VAR);
        }
    }
    eat(tk::RPAREN);
    while(current_token->id != tk::END){
        statement();
    }
    eat(tk::END);
    eat(tk::METHOD);
    return 0;
}

ast::AST *Parser::statement(){
    switch(current_token->id){
        case tk::ID_VAR:
            eat(tk::ID_VAR);
            if(current_token->id == tk::EQ) assignment();
            else expr();
            break;
        case tk::INT: expr(); break;
        case tk::FLOAT: expr(); break;
        case tk::IF: break;
        case tk::LOOP: break;
        case tk::ID_METHOD: break;
        default: std::cout << "unexpected token: " <<
                 *tk::id_to_str(current_token->id); 
                 exit(1);
    }
    return 0;
}


ast::AST *Parser::assignment(){
    eat(tk::EQ);
    expr();
    return 0;
}

ast::AST *Parser::expr(){
    term();
    while(current_token->id == tk::PLUS ||
            current_token->id == tk::MINUS){
        if(current_token->id == tk::PLUS){
            eat(tk::PLUS);
            term();
        }else if(current_token->id == tk::MINUS){
            eat(tk::MINUS);
            term();
        }
    }
    return 0;
}

ast::AST *Parser::term(){
    factor();
    while(current_token->id == tk::MULT ||
            current_token->id == tk::DIV_WQ ||
            current_token->id == tk::DIV_WOQ ||
            current_token->id == tk::MOD){
        switch(current_token->id){
            case tk::MULT: eat(tk::MULT); factor(); break;
            case tk::DIV_WQ: eat(tk::DIV_WQ); factor(); break;
            case tk::DIV_WOQ: eat(tk::DIV_WOQ); factor(); break;
            case tk::MOD: eat(tk::MOD); factor(); break;
            default: break;
        }
    }
    return 0;
}

ast::AST *Parser::factor(){
    switch(current_token->id){
        case tk::INT:
            eat(tk::INT);
            break;
        case tk::FLOAT:
            eat(tk::FLOAT);
            break;
        case tk::ID_VAR:
            eat(tk::ID_VAR);
            break;
        case tk::LPAREN:
            eat(tk::LPAREN);
            expr();
            eat(tk::RPAREN);
            break;
        default: break;
    }
    return 0; 
}

}
