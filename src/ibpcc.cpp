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
}

void test_lexer(char *filename){
    lxr::Lexer lex(get_buffer(filename));
    tk::Token *token = lex.get_next_token();
    while(token->id != tk::END_FILE){
        std::cout << *tok_to_str(token) << std::endl;
        token = lex.get_next_token();
    }
}

void test_parser(char *filename){
    lxr::Lexer lex(get_buffer(filename));
    prs::Parser parser(lex);
    ast::AST *root = parser.parse();
    ast::print_tree(root);
    //std::cout << nv::visit_expr(root);
}

}
