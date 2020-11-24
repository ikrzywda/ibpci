#include "include/Lexer.hpp"

namespace lxr{

Lexer::Lexer(std::string *buffer){
    Lexer::input_buffer = buffer;
    attr_buffer = new std::string;
    pos = 0;
    c = input_buffer->at(pos);
}

void Lexer::advance(){
    pos++;
    c = input_buffer->at(pos);
}

tk::Token *Lexer::number(){
    attr_buffer->push_back(c);
    advance();
    while(std::isdigit(c)){
        attr_buffer->push_back(c);
        advance();
    }
    return new tk::Token(tk::NUM, attr_buffer);
}   

tk::Token *Lexer::id_method(){
    attr_buffer->push_back(c);
    advance();
    while(isalnum(c) || al::is_miscchar(c)){
        attr_buffer->push_back(c);
        advance();
    }
    return new tk::Token(tk::ID_METHOD, attr_buffer);
}   

tk::Token *Lexer::id(){
    attr_buffer->push_back(c);
    advance();
    while(al::is_upcase(c) || al::is_miscchar(c)){
        attr_buffer->push_back(c);
        advance();
        if(al::is_lowcase(c)){
            return id_method();
        }
    }
    return new tk::Token(tk::ID_VAR, attr_buffer);
}

tk::Token *Lexer::op_eq(char ch){
    advance();
    if(c == '='){
        switch(ch){
            case '=': advance(); return new tk::Token(tk::IS, &noattr);
            case '<': advance(); return new tk::Token(tk::LEQ, &noattr);
            case '>': advance(); return new tk::Token(tk::GEQ, &noattr);
        }
    }else{
        switch(ch){
            case '=': return new tk::Token(tk::EQ, &noattr);
            case '<': return new tk::Token(tk::LT, &noattr);
            case '>': return new tk::Token(tk::GT, &noattr);
        }
    }
    return 0;
}

tk::Token *Lexer::get_next_token(){
    while(c != '\0'){
        attr_buffer->clear();
        if(std::isdigit(c)){
            return number();
        }else if(al::is_upcase(c)){
            return id();
        }else if(std::isalnum(c)){
            return id_method();
        }else if(std::isspace(c)){
            advance();
        }else{
            switch(c){
                case '+': advance(); return new tk::Token(tk::PLUS, &noattr);
                case '-': advance(); return new tk::Token(tk::MINUS, &noattr);
                case '*': advance(); return new tk::Token(tk::MULT, &noattr);
                case '/': advance(); return new tk::Token(tk::DIV, &noattr);
                case '%': advance(); return new tk::Token(tk::MOD, &noattr);
                case '[': advance(); return new tk::Token(tk::LSQBR, &noattr);
                case ']': advance(); return new tk::Token(tk::RSQBR, &noattr);
                case '(': advance(); return new tk::Token(tk::LPAREN, &noattr);
                case ')': advance(); return new tk::Token(tk::RPAREN, &noattr);
                case '.': advance(); return new tk::Token(tk::DOT, &noattr);
                case ',': advance(); return new tk::Token(tk::COMMA, &noattr);
                case '=': return op_eq('=');
                case '>': return op_eq('>');
                case '<': return op_eq('<');
            }
        }
    }
    std::cout << "unexpected char" << std::endl;
    return new tk::Token(tk::END, &noattr);
}

}
