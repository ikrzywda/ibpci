#include "include/IBPCI.hpp"

bool IBPCI::file_exists(const char *filename)
{
    if(std::ifstream(filename).good())
    {
        return true;
    }

    return false;
}

IBPCI::RunTime::RunTime(const char *filepath) : filename{filepath}
{
    std::ifstream f{filepath};
    std::string line;

    while(std::getline(f, line))
    {
        input_buffer += (line + '\n');
    }

    buffer_len = input_buffer.size();
}

