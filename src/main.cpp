#include "include/test.hpp"

int main(int argc, char **argv){
    std::string flag = argv[1];
    if(flag == "-l")
        test::test_lexer(argv[2]);
    else if(flag == "-p")
        test::test_parser(argv[2]);
    else if(flag == "-i")
        test::test_interpreter();
}
