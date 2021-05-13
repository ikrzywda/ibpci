#ifndef IBPCI_HPP
#define IBPCI_HPP

#include "Lexer.hpp"
#include "Parser.hpp"
#include "Interpreter.hpp"

#include <string>

namespace ibpci
{


class Ibpci
{
    private:
        std::string buffer; 
    public:
        Ibpci(char *filename);
};


}

#endif
