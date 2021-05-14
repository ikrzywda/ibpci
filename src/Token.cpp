#include "include/Token.hpp"

IBPCI::Token::Token() {}

IBPCI::Token::Token(unsigned line_num, unsigned id, double num) :
    LINE_NUM{line_num}, ID{id}, VAL_NUM{num}, VAL_STR{} {}

IBPCI::Token::Token(unsigned line_num, unsigned id, std::string str) :
    LINE_NUM{line_num}, ID{id}, VAL_NUM{0}, VAL_STR{str} {}


void IBPCI::Token::print()
{
    std::cout << LINE_NUM << ", "
              << ID << ", "
              << VAL_NUM << ", "
              << VAL_STR << std::endl;
}



int IBPCI::lookup_keyword(std::string lexeme)
{
    if(IBPCI::RESERVED_KEYWORDS.find(lexeme) != IBPCI::RESERVED_KEYWORDS.end())
    {
        return IBPCI::RESERVED_KEYWORDS.at(lexeme);
    }
    else
    {
        return 0;
    }
}

