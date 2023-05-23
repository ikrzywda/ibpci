#include <jsonrpccpp/client.h>
#include "include/ibpci.hpp"

void print_help() {
  std::cout << "Welcome to ibpci - the IB pseudocode interpreter" << std::endl
            << "Basic usage: ibpci <filepath>" << std::endl
            << "Additional flags: " << std::endl
            << " * -p : see abstract syntax tree of your code" << std::endl
            << " * -l : see tokens your code consists of" << std::endl
            << " * -s : log call stack of your program (best to pipe to less)"
            << std::endl;
  exit(1);
}

int flag_to_runmode(std::string flag) {
  if (!flag.compare("-p")) {
    return PRINT_AST;
  } else if (!flag.compare("-l")) {
    return PRINT_TOKENS;
  } else if (!flag.compare("-s")) {
    return PRINT_CALL_STACK;
  }
  return -1;
}

int main(int argc, char **argv) {
  int flag;
  if (argc == 3 && (flag = flag_to_runmode(argv[1])) > 0) {
    interpret(argv[2], flag);
  } else {
    interpret(argv[1], INTERPRET);
  }

  // run_parser(get_buffer(argv[1]));

  if (argc == 1) {
    print_help();
  }
}
