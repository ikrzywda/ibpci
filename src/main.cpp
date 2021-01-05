#include "include/test.hpp"

int main(int argc, char **argv){
    if(argv[1][0] == 'l')
        test::test_lexer(argv[2]);
}
