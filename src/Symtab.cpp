#include "include/Symtab.hpp"
namespace sym{

void test_table(){
    Symbol<std::string> sym_1 = Symbol<std::string>();
    Symbol<int> sym_2 = Symbol<int>();
    sym_1.push_dimensions(3);
    sym_1.push_dimensions(10);
    sym_1.push_contents("hello");
    sym_1.push_contents("there");
    sym_1.push_contents("this");
    sym_1.push_contents("is me");
    sym_2.push_dimensions(10);
    sym_2.push_contents(123);
    sym_2.push_contents(12321);
    sym_2.push_contents(5345);
    sym_2.push_contents(64564);
    sym_1.print_symbol();
    sym_2.print_symbol();
}

}
