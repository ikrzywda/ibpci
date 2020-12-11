#include "include/Lexer.hpp"

namespace lxr{

int is_upcase(char c){
    return (c >= 'A' && c <= 'Z') || isdigit(c) || c == '_' ? 1 : 0;
}

Lexer::Lexer(std::string *buffer){
    Lexer::input_buffer = buffer;
    attr_buffer = new std::string;
    pos = 0, len = buffer->size();
    c = input_buffer->at(pos);
}

void Lexer::advance(){
    pos++;
    if(pos < len - 1){ 
        c = input_buffer->at(pos);
    }else{
        c = EOF;
    }
}

void Lexer::skip_whitespace(){
    while(std::isspace(c)){
        advance();
    }
}

void Lexer::skip_comment(){
    while(c != '\n'){
        advance();
    }
}

tk::Token *Lexer::number(){
    int id = tk::INT;
    attr_buffer->push_back(c);
    advance();
    while(std::isdigit(c) || c =='.'){
        if(c == '.' && id == tk::FLOAT) break;
        if(c == '.') id = tk::FLOAT;
        attr_buffer->push_back(c);
        advance();
    }
    return new tk::Token(id, attr_buffer);
}   

tk::Token *Lexer::id(){
    int id = tk::ID_VAR;
    attr_buffer->push_back(c);
    advance();
    while(std::isalnum(c) || c == '_'){
        if(!is_upcase(c)) id = tk::ID_METHOD;
        attr_buffer->push_back(c);
        advance();
    }
    if(tk::lookup_keyword(*attr_buffer) > 0){
        id = tk::lookup_keyword(*attr_buffer); 
    }
    return new tk::Token(id, attr_buffer);
}   

tk::Token *Lexer::string(){
    advance();
    while(c != '\"' && c != EOF){
        attr_buffer->push_back(c);
        advance();
    }
    advance();
    return new tk::Token(tk::STRING, attr_buffer);
}

tk::Token *Lexer::op_eq(char ch){
    advance();
    if(c == '='){
        switch(ch){
            case '=': advance(); noattr = "=="; return new tk::Token(tk::IS, &noattr);
            case '<': advance(); noattr = "<="; return new tk::Token(tk::LEQ, &noattr);
            case '>': advance(); noattr = ">="; return new tk::Token(tk::GEQ, &noattr);
            case '!': advance(); noattr = "!="; return new tk::Token(tk::DNEQ, &noattr);
        }
    }else{
        switch(ch){
            case '=': noattr = "="; return new tk::Token(tk::EQ, &noattr);
            case '<': noattr = "<"; return new tk::Token(tk::LT, &noattr);
            case '>': noattr = ">"; return new tk::Token(tk::GT, &noattr);
        }
    }
    return 0;
}

tk::Token *Lexer::get_next_token(){
    while(1){
        skip_whitespace();
        attr_buffer->clear();
        if(std::isdigit(c)){
            return number();
        }else if(std::isalnum(c)){
            return id();
        }else{
            switch(c){
                case '+': advance(); noattr = "+"; return new tk::Token(tk::PLUS, &noattr);
                case '-': advance(); noattr = "-"; return new tk::Token(tk::MINUS, &noattr);
                case '*': advance(); noattr = "*"; return new tk::Token(tk::MULT, &noattr);
                case '%': advance(); noattr = "%"; return new tk::Token(tk::MOD, &noattr);
                case '[': advance(); noattr = "]"; return new tk::Token(tk::LSQBR, &noattr);
                case ']': advance(); noattr = "]"; return new tk::Token(tk::RSQBR, &noattr);
                case '(': advance(); noattr = "("; return new tk::Token(tk::LPAREN, &noattr);
                case ')': advance(); noattr = ")"; return new tk::Token(tk::RPAREN, &noattr);
                case '.': advance(); noattr = "."; return new tk::Token(tk::DOT, &noattr);
                case ',': advance(); noattr = ","; return new tk::Token(tk::COMMA, &noattr);
                case '\"': return string();
                case '=': return op_eq('=');
                case '>': return op_eq('>');
                case '<': return op_eq('<');
                case '!': return op_eq('!');
                case '/': 
                    advance();
                    if(c == '/'){ 
                        skip_comment();
                        break;   
                    }else{noattr = "/";return new tk::Token(tk::DIV_WOQ, &noattr);}
                case EOF: return new tk::Token(tk::END_FILE, &noattr);
                default:
                    std::cout << "\nunexpected character: '" << c << "'\n";
                    return new tk::Token(tk::END_FILE, &noattr);

            }
        }
    }
    return new tk::Token(tk::END_FILE, &noattr);
}

}
