#include "include/Parser.hpp"

namespace prs{
    
Parser::Parser(const lxr::Lexer &lexer) : lex(lexer){
    tok_curr = lex.get_next_token();
}

void Parser::eat(int token_id){
    std::cout << "current_tok: " << *tok_curr->attr << std::endl;
    if(tok_curr->id == token_id){
        tok_curr = lex.get_next_token();
    }else{
        std::cout << "unexpected token: " << 
            *tk::id_to_str(tok_curr->id) <<
            ", expected token: " << *tk::id_to_str(token_id) <<
            std::endl;
            exit(1);
    }   
}

ast::AST *Parser::parse(){
    ast::AST *root = NewNode(ast::START, "0");
    while(tok_curr->id != tk::END_FILE){
        root->nodes.push_back(statement());
        std::cout << "current_tok: " << *tok_curr->attr << std::endl;
        eat(tok_curr->id);
    }
    return root;
}

ast::AST *Parser::statement(){
    switch(tok_curr->id){
        case tk::ID_VAR:
            return basic_statement();
    }
    return NULL;
}

ast::AST *Parser::basic_statement(){
    tok_prev = tok_curr;
    std::cout << "prev token: " << tok_prev->attr->c_str();
    eat(tk::ID_VAR);
    std::cout << "prev token: " << tok_prev->attr->c_str();
    if(tok_curr->id == tk::EQ){
        return assign();
    }else{
        return expr();
    }
}

ast::AST *Parser::assign(){
    ast::AST *root = ast::NewNode(ast::ASSIGN, "0");
    root->nodes.push_back(ast::NewNode(ast::ID_VAR, tok_prev->attr->c_str()));
    root->op = tk::EQ;
    eat(tk::EQ);
    root->nodes.push_back(expr());
    return root;
}

ast::AST *Parser::expr(){
    ast::AST *root, *new_node;
    root = term();
    while(tok_curr->id == tk::PLUS 
            || tok_curr->id == tk::MINUS){
        new_node = ast::NewNode(ast::BINOP, "0");
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(term());
    }
    return root;
}

ast::AST *Parser::term(){
    ast::AST *subroot, *new_node;
    subroot = factor();
    while(tok_curr->id == tk::MULT ||
            tok_curr->id == tk::DIV_WQ ||
            tok_curr->id == tk::DIV_WOQ ||
            tok_curr->id == tk::MOD){
        new_node = ast::NewNode(ast::BINOP, "0");
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(subroot);
        subroot = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(factor());
    }
    return subroot;
}

ast::AST *Parser::factor(){
    ast::AST *new_node;
    std::string *attr_cpy = new std::string(tok_curr->attr->c_str());
    switch(tok_curr->id){
        case tk::INT:
            new_node = ast::NewNode(ast::NUM, attr_cpy->c_str());
            eat(tk::INT);
            return new_node;
        case tk::FLOAT:
            new_node = ast::NewNode(ast::NUM, attr_cpy->c_str());
            eat(tk::FLOAT);
            return new_node;
        case tk::ID_VAR:
            new_node = ast::NewNode(tk::ID_VAR, attr_cpy->c_str());
            eat(tk::ID_VAR);
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
