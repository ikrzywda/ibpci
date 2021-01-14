#include "include/ibpci.hpp"

std::string get_buffer(char *filename){
    char c;
    std::fstream file(filename);
    if(!file.good()){
        std::cout << "ERROR: file " << filename << " does not exist" << std::endl;
        exit(1);
    }
    std::string buffer;
    while(!file.eof()){
        file.get(c);
        buffer += c;
    }
    file.close();
    return buffer;
}


void run_lexer(char *filename){
    lxr::Lexer lex(get_buffer(filename));
    tk::Token token = lex.get_next_token();
    while(token.id != tk::END_FILE){
        std::cout << "line " << lex.line_num << ": ";
        tk::print_token(&token);
        token = lex.get_next_token();
    }
}

void run_parser(char *filename){
    prs::Parser parser(get_buffer(filename)); 
    ast::AST *root = parser.parse();
    ast::print_tree(root, 0);
    ast::delete_tree(root);
}

void run_interpreter(char *filename, bool logging){
    prs::Parser parser(get_buffer(filename)); 
    ast::AST *root = parser.parse();
    IBPCI::Interpreter ibpci(root, logging);
    ibpci.interpret();
}
