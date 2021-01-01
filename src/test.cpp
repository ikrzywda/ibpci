#include "include/test.hpp"

namespace test{

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
    std::string *buffer = get_buffer(filename);
    std::string *out;
    lxr::Lexer lex(buffer);
    tk::Token *token = lex.get_next_token();
    while(token->id != tk::END_FILE){
        out = tok_to_str(token);
        std::cout << *out << lex.line_num << std::endl;
        delete token;
        delete out;
        token = lex.get_next_token();
    }
    delete token;
    //delete buffer;
}

void test_parser(char *filename){
    std::vector<int> t;
    for(int i = 0; i < 10; ++i) t.push_back(i);
    for(auto &a : t) std::cout << ", " << a;
    t.erase(t.begin() + 3);
    t.erase(t.begin() + 1);
    t.erase(t.begin() + 7);
    std::cout << "test:";
    for(auto &a : t) std::cout << a;
    //lxr::Lexer lex(get_buffer(filename));
    //prs::Parser parser(lex);
    //ast::AST *root = parser.parse();
    //ast::print_tree(root, 0);
}

void tree(char *filename){
    lxr::Lexer lex(get_buffer(filename));
    prs::Parser parser(lex);
    ast::AST *root = parser.parse();
    ast::print_tree(root, 0);
    ibpcc::IBPCC interpreter(root);
    std::cout << "\n=============\n";
    ast::print_tree(root, 0);
}

}
