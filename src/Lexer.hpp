#ifndef LEXER_HPP
#define LEXER_HPP

#include <iostream>
#include <fstream>
#include <string>

class Lexer{
    private:
        std::ifstream *input_file; 
    public:
        Lexer(const char *filepath);
        void output_file();
};

#endif
