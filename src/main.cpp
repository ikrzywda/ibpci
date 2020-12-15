#include "include/ibpcc.hpp"

int main(int argc, char **argv){
    if(argv[1][0] == 'l')
        ibpcc::test_lexer(argv[2]);
    else if(argv[1][0] == 'p'){
        ibpcc::test_parser(argv[2]);
    }else if(argv[1][0] == 't'){
        ibpcc::tree(argv[2]);
    }
}
