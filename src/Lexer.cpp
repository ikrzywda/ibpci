#include "Lexer.hpp"

Lexer::Lexer(const char *filepath){
    input_file = new std::ifstream(filepath);
}

void Lexer::output_file(){
    std::string line;
    while(std::getline(*input_file, line, '\n')){
        std::cout << line << std::endl;
    }
    input_file -> close();
}
