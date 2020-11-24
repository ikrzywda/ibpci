#include "include/Alphabet.hpp"

namespace al{

int is_upcase(char c){
    return c >= 'A' && c <= 'Z' ? 1 : 0;
}

int is_lowcase(char c){
    return c >= '0' && c <= '9' ? 1 : 0;
}

int is_miscchar(char c){
    return c == '_' || std::isdigit(c) ? 1 : 0;
}   
}
