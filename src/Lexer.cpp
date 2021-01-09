#include "include/Lexer.hpp"

namespace lxr{

Lexer::Lexer(std::string&& buffer) : input_buffer(buffer){
    token = tk::Token();
    pos = 0, len = buffer.size();
    c = input_buffer.at(pos);
    line_num = 1;
}

int is_upcase(char c){
    return (c >= 'A' && c <= 'Z') || isdigit(c) || c == '_' ? 1 : 0;
}

void Lexer::error(){
    std::cout << "Unexpected character at line " << line_num << ": '"
        << c << "'\n";
    exit(1);
}

void Lexer::advance(){
    pos++;
    if(pos < len - 1){ 
        c = input_buffer.at(pos);
    }else{
        c = EOF;
    }
}

void Lexer::skip_whitespace(){
    while(c == ' '
            || c == '\t'
            || c == '\v'
            || c == '\f'){
        advance();
    }
}

void Lexer::skip_comment(){
    while(c != '\n'){
        advance();
    }
}

tk::Token &Lexer::number(){
    int id = tk::INT;
    std::string buffer;
    buffer.push_back(c);
    advance();
    while(std::isdigit(c) || c =='.'){
        if(c == '.' && id == tk::FLOAT) break;
        if(c == '.') id = tk::FLOAT;
        buffer.push_back(c);
        advance();
    }
    token.mutate(tk::NUM, std::stod(buffer), line_num);
    return token;
}   

tk::Token &Lexer::id(){
    int id = tk::ID_VAR;
    attr_buffer.push_back(c);
    if(!is_upcase(c)) id = tk::ID_METHOD;
    advance();
    while(std::isalnum(c) || c == '_'){
        if(!is_upcase(c)) id = tk::ID_METHOD;
        attr_buffer.push_back(c);
        advance();
    }
    if(tk::lookup_keyword(attr_buffer) > 0)
        id = tk::lookup_keyword(attr_buffer);
    token.mutate(id, attr_buffer, line_num);
    return token;
}   

tk::Token &Lexer::string(){
    advance();
    while(c != '\"' && c != EOF){
        attr_buffer.push_back(c);
        advance();
    }
    advance();
    token.mutate(tk::STRING, attr_buffer, line_num);
    return token;
}

tk::Token &Lexer::op_eq(char ch){
    advance();
    if(c == '='){
        switch(ch){
            case '=': advance(); attr_buffer = "=="; token.mutate(tk::IS, attr_buffer, line_num); return token;
            case '<': advance(); attr_buffer = "<="; token.mutate(tk::LEQ, attr_buffer, line_num); return token;
            case '>': advance(); attr_buffer = ">="; token.mutate(tk::GEQ, attr_buffer, line_num); return token;
            case '!': advance(); attr_buffer = "!="; token.mutate(tk::DNEQ, attr_buffer, line_num); return token;
        }
    }else{
        switch(ch){
            case '=': attr_buffer = "="; token.mutate(tk::EQ, attr_buffer, line_num); return token;
            case '<': attr_buffer = "<"; token.mutate(tk::LT, attr_buffer, line_num); return token;
            case '>': attr_buffer = ">"; token.mutate(tk::GT, attr_buffer, line_num); return token;
        }
    }
    return token;
}

tk::Token &Lexer::get_next_token(){
    while(1){
        skip_whitespace();
        attr_buffer.clear();
        if(std::isdigit(c)){
            return number();
        }else if(std::isalnum(c)){
            return id();
        }else{
            switch(c){
                case '+': advance(); attr_buffer = "+"; token.mutate(tk::PLUS, attr_buffer, line_num); return token;
                case '-': advance(); attr_buffer = "-"; token.mutate(tk::MINUS, attr_buffer, line_num); return token;
                case '*': advance(); attr_buffer = "*"; token.mutate(tk::MULT, attr_buffer, line_num); return token;
                case '%': advance(); attr_buffer = "%"; token.mutate(tk::MOD, attr_buffer, line_num); return token;
                case '[': advance(); attr_buffer = "]"; token.mutate(tk::LSQBR, attr_buffer, line_num); return token;
                case ']': advance(); attr_buffer = "]"; token.mutate(tk::RSQBR, attr_buffer, line_num); return token;
                case '(': advance(); attr_buffer = "("; token.mutate(tk::LPAREN, attr_buffer, line_num); return token;
                case ')': advance(); attr_buffer = ")"; token.mutate(tk::RPAREN, attr_buffer, line_num); return token;
                case '.': advance(); attr_buffer = "."; token.mutate(tk::DOT, attr_buffer, line_num); return token;
                case ',': advance(); attr_buffer = ","; token.mutate(tk::COMMA, attr_buffer, line_num); return token;
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
                    }else{attr_buffer = "/"; token.mutate(tk::DIV_WOQ, attr_buffer, line_num); return token;}
                case '\n': advance(); ++line_num; break;
                case EOF: attr_buffer = "EOF"; token.mutate(tk::END_FILE, attr_buffer, line_num); return token;
                default: error();
            }
        }
    }
    return token;
}

}
