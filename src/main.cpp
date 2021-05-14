#include "include/IBPCI.hpp"
#include "include/Lexer.hpp"

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

    if(argc < 2) return 0;

    if(IBPCI::file_exists(argv[1]))
    {
        IBPCI::Lexer ibpci{argv[1]};
        ibpci.print_all_tokens();
    }


}
