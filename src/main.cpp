#include "include/test.hpp"

int main(int argc, char **argv){
    if(argv[1][0] == 'l')
        test::test_lexer(argv[2]);
    else if(argv[1][0] == 'p'){
        test::test_parser(argv[2]);
    }else if(argv[1][0] == 't'){
        test::tree(argv[2]);
    }
}
