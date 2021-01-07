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

void test_parser(char *filename){
    prs::Parser parser(lxr::Lexer(get_buffer(filename))); 
    ast::AST *root = parser.parse();
    ast::print_tree(root, 0);
    ast::delete_tree(root);
}

void test_interpreter(char *filename){
    prs::Parser parser(lxr::Lexer(get_buffer(filename))); 
    ast::AST *root = parser.parse();
    IBPCI::Interpreter ibpci(root);
    ibpci.execute();
}

}
