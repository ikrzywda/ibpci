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
    //lxr::Lexer lex(get_buffer(filename));
    std::string str1, str2;
    str1 = "+";
    str2 = "12";
    tk::Token *tt1 = new tk::Token(tk::PLUS, &str1);
    tk::Token *tt2 = new tk::Token(tk::INT, &str2);
    tk::Token *tt3 = new tk::Token(tk::INT, &str2);
    ast::AST *l1 = ast::Num(tt2);
    ast::AST *l2 = ast::Num(tt3);
    ast::AST *new_node = ast::BinOp(l1, tt1, l2);
    nv::print_ast(new_node);
    //prs::Parser parser(lex);
    //parser.parse();
}

}
