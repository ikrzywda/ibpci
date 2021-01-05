#include "include/test.hpp"

namespace test{

std::string get_buffer(char *filename){
    char c;
    std::fstream file;
    std::string buffer;
    file.open(filename, std::ios::in);
    while(!file.eof()){
        file.get(c);
        buffer += c;
    }
    file.close();
    return buffer;
}

void test_lexer(char *filename){
    lxr::Lexer lex(get_buffer(filename));
    tk::Token token = lex.get_next_token();
    while(token.id != tk::END_FILE){
        std::cout << "line " << lex.line_num << ": ";
        tk::print_token(&token);
        token = lex.get_next_token();
    }
}



}
