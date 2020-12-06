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

ast::AST *Parser::parse(){
    return expr();
}

ast::AST *Parser::assign(){
    ast::AST *root = NewNode(ast::ASSIGN, "0"), *new_node;
    if(current_token->id == tk::EQ){
        new_node->op = current_token->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(tk::EQ);
        new_node->nodes.push_back(expr());
    }
    return root;
}

ast::AST *Parser::expr(){
    ast::AST *root, *new_node;
    root = term();
    while(current_token->id == tk::PLUS 
            || current_token->id == tk::MINUS){
        new_node = ast::NewNode(ast::BINOP, "0");
        new_node->op = current_token->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(current_token->id);
        new_node->nodes.push_back(term());
    }
    return root;
}

ast::AST *Parser::term(){
    ast::AST *subroot, *new_node;
    subroot = factor();
    while(current_token->id == tk::MULT ||
            current_token->id == tk::DIV_WQ ||
            current_token->id == tk::DIV_WOQ ||
            current_token->id == tk::MOD){
        new_node = ast::NewNode(ast::BINOP, "0");
        new_node->op = current_token->id;
        new_node->nodes.push_back(subroot);
        subroot = new_node;
        eat(current_token->id);
        new_node->nodes.push_back(factor());
    }
    return subroot;
}

ast::AST *Parser::factor(){
    ast::AST *new_node;
    std::string *attr_cpy = new std::string(current_token->attr->c_str());
    switch(current_token->id){
        case tk::INT:
            new_node = ast::NewNode(ast::NUM, attr_cpy->c_str());
            eat(tk::INT);
            return new_node;
        case tk::FLOAT:
            new_node = ast::NewNode(ast::NUM, attr_cpy->c_str());
            eat(tk::FLOAT);
            return new_node;
        case tk::LPAREN:
            eat(tk::LPAREN);
            new_node = expr();
            eat(tk::RPAREN);
            return new_node;
        case tk::END_FILE: std::cout << "END";
        default: break;
    }
    return 0; 
}

}
