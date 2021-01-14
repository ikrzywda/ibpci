#include "include/ibpci.hpp"

void print_help(){
    std::cout << "Welcome to ibpci - the IB pseudocode interpreter" << std::endl
              << "Basic usage: ibpci <filepath>" << std::endl
              << "Additional flags: " << std::endl 
              << " * -p : see abstract syntax tree of your code" << std::endl
              << " * -l : see tokens your code consists of" << std::endl
              << " * -s : log call stack of your program (best to pipe to less)" << std::endl;
    exit(1);
}

int main(int argc, char **argv){
    if(argc == 1){ 
        print_help();
    }
    std::string flag = argv[1];
    if(flag == "-l")
        run_lexer(argv[2]);
    else if(flag == "-p")
        run_parser(argv[2]);
    else if(flag == "-s")
        run_interpreter(argv[2], true);
    else
        run_interpreter(argv[1], false);
}
