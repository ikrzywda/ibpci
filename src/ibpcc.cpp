#include "include/ibpcc.hpp"

namespace ibpcc{

std::string *get_buffer(char *filename){
    char c;
    std::fstream file;
    std::string *buffer = new std::string;
    file.open(filename, std::ios::in);
    while(!file.eof()){
        file.get(c);
        *buffer += c;
    }
    file.close();
    return buffer;
}


void compile(char *filename){
    tk::Token *tkn;
    lxr::Lexer lex(get_buffer(filename));
    while((tkn = lex.get_next_token())->id != tk::END){
        std::cout << *tk::tok_to_str(tkn);
    }
}

}
